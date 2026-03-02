'use server';

import { createDb } from '@/db';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { shoppingListItems, inventoryItems, users } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { auth } from '@/auth';

async function getRequiredSession() {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("認証が必要です");
    }
    return session.user.id;
}

export async function getShoppingItems() {
    try {
        const userId = await getRequiredSession();
        const { env } = await getCloudflareContext({ async: true });
        const db = createDb(env.DB);

        return await db.select().from(shoppingListItems).where(eq(shoppingListItems.userId, userId));
    } catch (error) {
        console.error("Failed to fetch shopping lists:", error);
        return [];
    }
}

// サーバーアクション: 買い物リストへの追加
export async function addShoppingItem(formData: FormData) {
    const name = formData.get('name') as string;
    const quantityStr = formData.get('quantity') as string;

    if (!name || !quantityStr) {
        return { error: "必須項目が入力されていません" };
    }

    const quantity = parseFloat(quantityStr);

    try {
        const userId = await getRequiredSession();
        const { env } = await getCloudflareContext({ async: true });
        const db = createDb(env.DB);

        // 未購入で同じ名前のアイテムがあるか確認
        const existingItems = await db.select().from(shoppingListItems)
            .where(and(
                eq(shoppingListItems.userId, userId),
                eq(shoppingListItems.name, name),
                eq(shoppingListItems.isPurchased, false)
            ));

        if (existingItems.length > 0) {
            // 既存アイテム（未購入）があれば個数を加算
            await db.update(shoppingListItems)
                .set({
                    quantity: sql`${shoppingListItems.quantity} + ${quantity}`,
                    updatedAt: new Date()
                })
                .where(eq(shoppingListItems.id, existingItems[0].id));
        } else {
            // なければ新規作成
            await db.insert(shoppingListItems).values({
                id: crypto.randomUUID(),
                userId: userId,
                name,
                quantity,
                unit: (formData.get('unit') as string) || '個',
                expectedPrice: formData.get('expectedPrice') ? parseFloat(formData.get('expectedPrice') as string) : null,
                category: formData.get('category') as string || null,
                memo: formData.get('memo') as string || null,
            });
        }

        // 成功時にキャッシュを破棄して画面を更新
        revalidatePath('/shopping');
        revalidatePath('/');

        return { success: true };
    } catch (error) {
        console.error("Failed to add shopping item:", error);
        return { error: "アイテムの追加に失敗しました" };
    }
}

// サーバーアクション: 買い物リストの購入済み状態の切り替え
export async function toggleShoppingItem(id: string, isPurchased: boolean) {
    try {
        const { env } = await getCloudflareContext({ async: true });
        const db = createDb(env.DB);

        await db.update(shoppingListItems)
            .set({ isPurchased })
            .where(eq(shoppingListItems.id, id));

        revalidatePath('/shopping');
        return { success: true };
    } catch (error) {
        console.error("Failed to toggle shopping item:", error);
        return { error: "ステータスの更新に失敗しました" };
    }
}

// サーバーアクション: 買い物リストアイテムの更新
export async function updateShoppingItem(id: string, formData: FormData) {
    const name = formData.get('name') as string;
    const quantityStr = formData.get('quantity') as string;

    if (!name || !quantityStr) {
        return { error: "必須項目が入力されていません" };
    }

    const quantity = parseFloat(quantityStr);

    try {
        const { env } = await getCloudflareContext({ async: true });
        const db = createDb(env.DB);

        await db.update(shoppingListItems)
            .set({
                name,
                quantity,
                unit: (formData.get('unit') as string) || '個',
                expectedPrice: formData.get('expectedPrice') ? parseFloat(formData.get('expectedPrice') as string) : null,
                category: formData.get('category') as string || null,
                memo: formData.get('memo') as string || null,
            })
            .where(eq(shoppingListItems.id, id));

        revalidatePath('/shopping');
        return { success: true };
    } catch (error) {
        console.error("Failed to update shopping item:", error);
        return { error: "アイテムの更新に失敗しました" };
    }
}

// サーバーアクション: 買い物リストアイテムの削除
export async function deleteShoppingItem(id: string) {
    try {
        const { env } = await getCloudflareContext({ async: true });
        const db = createDb(env.DB);

        await db.delete(shoppingListItems).where(eq(shoppingListItems.id, id));

        revalidatePath('/shopping');
        return { success: true };
    } catch (error) {
        console.error("Failed to delete shopping item:", error);
        return { error: "アイテムの削除に失敗しました" };
    }
}

// サーバーアクション: 買い物リストアイテムの購入と在庫への追加
export async function purchaseShoppingItem(id: string, formData: FormData) {
    const actualQuantityStr = formData.get('actualQuantity') as string;

    if (!actualQuantityStr) {
        return { error: "数量が入力されていません" };
    }

    const actualQuantity = parseFloat(actualQuantityStr);

    try {
        const userId = await getRequiredSession();
        const { env } = await getCloudflareContext({ async: true });
        const db = createDb(env.DB);

        // 買い物リストのアイテムを取得
        const items = await db.select().from(shoppingListItems).where(eq(shoppingListItems.id, id));
        if (items.length === 0) {
            return { error: "アイテムが見つかりません" };
        }
        const item = items[0];

        // 在庫テーブルに追加
        const actualPriceStr = formData.get('actualPrice') as string;
        const finalPrice = actualPriceStr ? parseFloat(actualPriceStr) : item.expectedPrice;

        // 在庫テーブルに同じ名前があるか確認
        const existingInventoryItems = await db.select().from(inventoryItems)
            .where(and(
                eq(inventoryItems.userId, userId),
                eq(inventoryItems.name, item.name)
            ));

        if (existingInventoryItems.length > 0) {
            // 在庫にあれば個数加算・（価格等の更新も必要なら検討）
            await db.update(inventoryItems)
                .set({
                    quantity: sql`${inventoryItems.quantity} + ${actualQuantity}`,
                    price: finalPrice, // 今回の購入価格で上書き、あるいは加重平均などは要検討だが、一旦シンプルに上書き
                    updatedAt: new Date()
                })
                .where(eq(inventoryItems.id, existingInventoryItems[0].id));
        } else {
            // 在庫になければ新規作成
            await db.insert(inventoryItems).values({
                id: crypto.randomUUID(),
                userId: userId,
                name: item.name,
                quantity: actualQuantity,
                unit: item.unit,
                price: finalPrice,
                category: item.category,
                memo: item.memo,
            });
        }

        // 買い物リストのステータスを購入済みに更新
        await db.update(shoppingListItems)
            .set({ isPurchased: true })
            .where(eq(shoppingListItems.id, id));

        // 予算の使用額をユーザーに反映
        if (finalPrice && finalPrice > 0) {
            await db.update(users)
                .set({ totalSpent: sql`${users.totalSpent} + ${finalPrice}` })
                .where(eq(users.id, userId));
        }

        revalidatePath('/shopping');
        revalidatePath('/inventory');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error("Failed to purchase shopping item:", error);
        return { error: "購入処理に失敗しました" };
    }
}
