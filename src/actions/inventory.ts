'use server';

import { createDb } from '@/db';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { inventoryItems } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

const DUMMY_USER_ID = 'dummy-user-123';

// サーバーアクション: アイテム一覧の取得
export async function getInventoryItems() {
    try {
        const { env } = await getCloudflareContext({ async: true });
        const db = createDb(env.DB);

        return await db.select().from(inventoryItems).where(eq(inventoryItems.userId, DUMMY_USER_ID));
    } catch (error) {
        console.error("Failed to fetch inventory:", error);
        return [];
    }
}

// サーバーアクション: アイテムの追加
export async function addInventoryItem(formData: FormData) {
    const name = formData.get('name') as string;
    const quantityStr = formData.get('quantity') as string;

    if (!name || !quantityStr) {
        return { error: "必須項目が入力されていません" };
    }

    const quantity = parseFloat(quantityStr);

    try {
        const { env } = await getCloudflareContext({ async: true });
        const db = createDb(env.DB);

        await db.insert(inventoryItems).values({
            id: crypto.randomUUID(),
            userId: DUMMY_USER_ID,
            name,
            quantity,
            unit: (formData.get('unit') as string) || '個',
            price: formData.get('price') ? parseFloat(formData.get('price') as string) : null,
            category: formData.get('category') as string,
            memo: formData.get('memo') as string,
        });

        // 成功時にキャッシュを破棄して画面を更新
        revalidatePath('/inventory');
        revalidatePath('/');

        return { success: true };
    } catch (error) {
        console.error("Failed to add inventory:", error);
        return { error: "アイテムの追加に失敗しました" };
    }
}

// サーバーアクション: アイテムの更新
export async function updateInventoryItem(id: string, formData: FormData) {
    const name = formData.get('name') as string;
    const quantityStr = formData.get('quantity') as string;

    if (!name || !quantityStr) {
        return { error: "必須項目が入力されていません" };
    }

    const quantity = parseFloat(quantityStr);

    try {
        const { env } = await getCloudflareContext({ async: true });
        const db = createDb(env.DB);

        await db.update(inventoryItems)
            .set({
                name,
                quantity,
                unit: (formData.get('unit') as string) || '個',
                price: formData.get('price') ? parseFloat(formData.get('price') as string) : null,
                category: formData.get('category') as string || null,
                memo: formData.get('memo') as string || null,
            })
            .where(eq(inventoryItems.id, id));

        revalidatePath('/inventory');
        return { success: true };
    } catch (error) {
        console.error("Failed to update inventory item:", error);
        return { error: "アイテムの更新に失敗しました" };
    }
}

// サーバーアクション: アイテムの削除
export async function deleteInventoryItem(id: string) {
    try {
        const { env } = await getCloudflareContext({ async: true });
        const db = createDb(env.DB);

        await db.delete(inventoryItems).where(eq(inventoryItems.id, id));

        revalidatePath('/inventory');
        return { success: true };
    } catch (error) {
        console.error("Failed to delete inventory item:", error);
        return { error: "アイテムの削除に失敗しました" };
    }
}
