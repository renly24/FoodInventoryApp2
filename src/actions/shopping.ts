'use server';

import { createDb } from '@/db';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { shoppingListItems, inventoryItems } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

const DUMMY_USER_ID = 'dummy-user-123';

export async function getShoppingItems() {
    try {
        const { env } = await getCloudflareContext({ async: true });
        const db = createDb(env.DB);

        return await db.select().from(shoppingListItems).where(eq(shoppingListItems.userId, DUMMY_USER_ID));
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
        const { env } = await getCloudflareContext({ async: true });
        const db = createDb(env.DB);

        await db.insert(shoppingListItems).values({
            id: crypto.randomUUID(),
            userId: DUMMY_USER_ID,
            name,
            quantity,
            unit: (formData.get('unit') as string) || '個',
            expectedPrice: formData.get('expectedPrice') ? parseFloat(formData.get('expectedPrice') as string) : null,
            category: formData.get('category') as string || null,
            memo: formData.get('memo') as string || null,
        });

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
        const { env } = await getCloudflareContext({ async: true });
        const db = createDb(env.DB);

        // 買い物リストのアイテムを取得
        const items = await db.select().from(shoppingListItems).where(eq(shoppingListItems.id, id));
        if (items.length === 0) {
            return { error: "アイテムが見つかりません" };
        }
        const item = items[0];

        // 在庫テーブルに追加
        await db.insert(inventoryItems).values({
            id: crypto.randomUUID(),
            userId: DUMMY_USER_ID,
            name: item.name,
            quantity: actualQuantity,
            unit: item.unit,
            price: formData.get('actualPrice') ? parseFloat(formData.get('actualPrice') as string) : null,
            category: item.category,
            memo: item.memo,
        });

        // 買い物リストのステータスを購入済みに更新
        await db.update(shoppingListItems)
            .set({ isPurchased: true })
            .where(eq(shoppingListItems.id, id));

        revalidatePath('/shopping');
        revalidatePath('/inventory');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error("Failed to purchase shopping item:", error);
        return { error: "購入処理に失敗しました" };
    }
}
