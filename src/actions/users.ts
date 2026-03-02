'use server';

import { createDb } from '@/db';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

const DUMMY_USER_ID = 'dummy-user-123';

// ユーザー情報の取得
export async function getProfile() {
    try {
        const { env } = await getCloudflareContext({ async: true });
        const db = createDb(env.DB);

        const results = await db.select().from(users).where(eq(users.id, DUMMY_USER_ID));
        if (results.length === 0) {
            // もしユーザーがいなかったら作成
            await db.insert(users).values({
                id: DUMMY_USER_ID,
                email: 'dummy@example.com',
                monthlyBudget: 30000, // 初期予算
                totalSpent: 0
            });
            return {
                id: DUMMY_USER_ID,
                email: 'dummy@example.com',
                monthlyBudget: 30000,
                totalSpent: 0,
                createdAt: new Date()
            };
        }
        return results[0];
    } catch (error) {
        console.error("Failed to fetch user profile:", error);
        return null;
    }
}

// 予算設定の更新
export async function updateBudget(budget: number) {
    try {
        const { env } = await getCloudflareContext({ async: true });
        const db = createDb(env.DB);

        await db.update(users)
            .set({ monthlyBudget: budget })
            .where(eq(users.id, DUMMY_USER_ID));

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error("Failed to update budget:", error);
        return { error: "予算の更新に失敗しました" };
    }
}

// 使用額のリセット（月次等）
export async function resetSpent() {
    try {
        const { env } = await getCloudflareContext({ async: true });
        const db = createDb(env.DB);

        await db.update(users)
            .set({ totalSpent: 0 })
            .where(eq(users.id, DUMMY_USER_ID));

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error("Failed to reset spent:", error);
        return { error: "履歴のリセットに失敗しました" };
    }
}

// 支出額の直接更新
export async function updateSpent(spent: number) {
    try {
        const { env } = await getCloudflareContext({ async: true });
        const db = createDb(env.DB);

        await db.update(users)
            .set({ totalSpent: spent })
            .where(eq(users.id, DUMMY_USER_ID));

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error("Failed to update spent:", error);
        return { error: "支出額の更新に失敗しました" };
    }
}
