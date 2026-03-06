'use server';

import { GoogleGenAI } from '@google/genai';
import { getCloudflareContext } from "@opennextjs/cloudflare"
import { auth } from "@/auth";
import { createDb } from "@/db";
import { inventoryItems, shoppingListItems, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// Gemini APIクライアントの初期化（サーバーサイドでのみ実行されます）
// 環境変数 GEMINI_API_KEY が必要です
const { env } = await getCloudflareContext({ async: true });

const apiKey = process.env.GEMINI_API_KEY || '';

const ai = new GoogleGenAI({
    apiKey
});

export type ReceiptItem = {
    name: string;
    quantity: number;
    unit?: string;
    price?: number;
    category?: string;
};

export type AnalyzeReceiptResult = {
    success: boolean;
    data?: ReceiptItem[];
    error?: string;
};

export async function analyzeReceiptAction(formData: FormData, mode?: 'inventory' | 'meal' | 'recipe'): Promise<AnalyzeReceiptResult> {
    if (!apiKey) {
        return { success: false, error: 'GEMINI_API_KEY が設定されていません。' };
    }

    try {
        const file = formData.get('receipt') as File;
        if (!file || file.size === 0) {
            return { success: false, error: '画像ファイルが見つかりません。' };
        }

        const buffer = await file.arrayBuffer();
        const base64Data = Buffer.from(buffer).toString('base64');
        const mimeType = file.type;

        const promptText = mode === 'recipe'
            ? '提供された料理の材料リストやレシピ画像のテキストを解析し、必要な材料を抽出してください。「材料名（name）」「必要な数量（quantity）」「単位（unit: g、個、大さじなど）」を取得し、JSONの配列として出力してください。数量は数値にしてください（例: 数量 1）。'
            : 'あなたは優秀なレシート入力アシスタントです。提供されたレシート画像のテキストを解析し、食品や日用品の項目を抽出してください。「商品名（name）」「数量（quantity）」「単価あるいは価格（price）」を取得し、可能であれば単位（unit: 個、gなど）も取得してください。JSONの配列として出力してください。数量や価格は数値にしてください（例: 数量 1, 価格 150）。割引や消費税などの項目は一品として除外してください。';

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: [
                {
                    role: 'user',
                    parts: [
                        { text: promptText },
                        { inlineData: { data: base64Data, mimeType } }
                    ]
                }
            ],
            config: {
                temperature: 0.1,
                responseMimeType: 'application/json',
                responseSchema: {
                    type: 'ARRAY',
                    description: mode === 'recipe' ? '抽出された材料のリスト' : 'レシートから抽出された商品のリスト',
                    items: {
                        type: 'OBJECT',
                        properties: {
                            name: {
                                type: 'STRING',
                                description: mode === 'recipe' ? '材料名（例: 牛乳, キャベツ）' : '商品の名前（例: 牛乳 1000ml, キャベツ）'
                            },
                            quantity: {
                                type: 'NUMBER',
                                description: '数や量'
                            },
                            unit: {
                                type: 'STRING',
                                description: '単位（例: 個, g, ml, 束, 大さじ）'
                            },
                            price: {
                                type: 'INTEGER',
                                description: '商品の単価あるいは価格'
                            },
                            category: {
                                type: 'STRING',
                                description: '推測される大まかなカテゴリ'
                            }
                        },
                        required: mode === 'recipe' ? ['name', 'quantity', 'unit'] : ['name', 'quantity', 'price']
                    }
                }
            }
        });

        const textResponse = response.text;

        if (!textResponse) {
            return { success: false, error: 'AIからの応答が空でした。' };
        }

        const items: ReceiptItem[] = JSON.parse(textResponse);

        return {
            success: true,
            data: items
        };

    } catch (error) {
        console.error('Receipt analysis error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : '予期せぬエラーが発生しました。'
        };
    }
}

export async function saveReceiptItemsAction(items: ReceiptItem[]) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: 'User not authenticated' };
        }

        const userId = session.user.id;
        const { env } = await getCloudflareContext({ async: true });
        const db = createDb(env.DB);

        for (const item of items) {
            // 買い物リストのチェック
            const shoppingItems = await db.select()
                .from(shoppingListItems)
                .where(and(
                    eq(shoppingListItems.userId, userId),
                    eq(shoppingListItems.name, item.name),
                    eq(shoppingListItems.isPurchased, false)
                ));

            if (shoppingItems.length > 0) {
                // 購入済みにする
                await db.update(shoppingListItems)
                    .set({ isPurchased: true, updatedAt: new Date() })
                    .where(and(
                        eq(shoppingListItems.userId, userId),
                        eq(shoppingListItems.name, item.name),
                        eq(shoppingListItems.isPurchased, false)
                    ));
            }

            // 在庫リストのチェック
            const existingItems = await db.select()
                .from(inventoryItems)
                .where(and(
                    eq(inventoryItems.userId, userId),
                    eq(inventoryItems.name, item.name)
                ));

            if (existingItems.length > 0) {
                // 既存の在庫があれば個数を増やす
                const existing = existingItems[0];
                await db.update(inventoryItems)
                    .set({
                        quantity: existing.quantity + item.quantity,
                        updatedAt: new Date()
                    })
                    .where(eq(inventoryItems.id, existing.id));
            } else {
                // 新規追加
                await db.insert(inventoryItems).values({
                    id: crypto.randomUUID(),
                    userId,
                    name: item.name,
                    quantity: item.quantity,
                    unit: '個', // デフォルト
                    price: item.price,
                    category: item.category,
                });
            }
        }

        // 支出合計を算出してユーザーの支出額（totalSpent）に加算
        const receiptTotal = items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
        if (receiptTotal > 0) {
            const userRows = await db.select().from(users).where(eq(users.id, userId));
            if (userRows.length > 0) {
                const currentSpent = userRows[0].totalSpent || 0;
                await db.update(users)
                    .set({ totalSpent: currentSpent + receiptTotal })
                    .where(eq(users.id, userId));
            }
        }

        return { success: true };
    } catch (error) {
        console.error('Failed to save receipt items:', error);
        return { success: false, error: error instanceof Error ? error.message : '保存に失敗しました' };
    }
}

export async function saveMealReceiptAction(items: ReceiptItem[], title?: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: 'User not authenticated' };
        }

        const userId = session.user.id;
        const { env } = await getCloudflareContext({ async: true });
        const db = createDb(env.DB);

        // 支出合計を算出して外食として記録
        const receiptTotal = items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);

        // （ダイナミックインポートなどで直接DB呼び出しのスキーマを解決）
        const { meals, users } = await import('@/db/schema');

        await db.insert(meals).values({
            id: crypto.randomUUID(),
            userId: userId,
            name: (title && title.trim() !== '') ? title : "外食 (レシート読取)",
            date: new Date(),
            expense: receiptTotal,
        });

        if (receiptTotal > 0) {
            const userRows = await db.select().from(users).where(eq(users.id, userId));
            if (userRows.length > 0) {
                const currentSpent = userRows[0].totalSpent || 0;
                await db.update(users)
                    .set({ totalSpent: currentSpent + receiptTotal })
                    .where(eq(users.id, userId));
            }
        }

        return { success: true };
    } catch (error) {
        console.error('Failed to save meal receipt:', error);
        return { success: false, error: error instanceof Error ? error.message : '保存に失敗しました' };
    }
}

export async function saveRecipeReceiptAction(items: ReceiptItem[], recipeId: string, title?: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: 'User not authenticated' };
        }

        const { env } = await getCloudflareContext({ async: true });
        const db = createDb(env.DB);
        const { recipeIngredients, recipes } = await import('@/db/schema');

        if (title && title.trim() !== '') {
            await db.update(recipes).set({ name: title }).where(eq(recipes.id, recipeId));
        }

        for (const item of items) {
            await db.insert(recipeIngredients).values({
                id: crypto.randomUUID(),
                recipeId,
                name: item.name,
                quantity: item.quantity,
                unit: item.unit || '個',
            });
        }

        return { success: true };
    } catch (error) {
        console.error('Failed to save recipe ingredients:', error);
        return { success: false, error: error instanceof Error ? error.message : '保存に失敗しました' };
    }
}
