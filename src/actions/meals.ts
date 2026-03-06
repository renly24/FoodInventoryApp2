'use server';

import { createDb } from '@/db';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { meals, users } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { auth } from '@/auth';

async function getRequiredSession() {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("認証が必要です");
    }
    return session.user.id;
}

export async function getMeals() {
    try {
        const userId = await getRequiredSession();
        const { env } = await getCloudflareContext({ async: true });
        const db = createDb(env.DB);

        return await db.select().from(meals).where(eq(meals.userId, userId)).orderBy(desc(meals.date));
    } catch (error) {
        console.error("Failed to fetch meals:", error);
        return [];
    }
}

export async function getMeal(id: string) {
    try {
        const userId = await getRequiredSession();
        const { env } = await getCloudflareContext({ async: true });
        const db = createDb(env.DB);

        const result = await db.select().from(meals).where(and(eq(meals.id, id), eq(meals.userId, userId)));
        return result.length > 0 ? result[0] : null;
    } catch (error) {
        console.error("Failed to fetch meal:", error);
        return null;
    }
}

// サーバーアクション: 食事記録の追加
export async function addMeal(formData: FormData) {
    const name = formData.get('name') as string;
    const dateStr = formData.get('date') as string;
    const expenseStr = formData.get('expense') as string;
    const expense = expenseStr ? Number(expenseStr) : 0;

    if (!name || !dateStr) {
        return { error: "必須項目が入力されていません" };
    }

    try {
        const userId = await getRequiredSession();
        const { env } = await getCloudflareContext({ async: true });
        const db = createDb(env.DB);

        await db.insert(meals).values({
            id: crypto.randomUUID(),
            userId: userId,
            name,
            date: new Date(dateStr),
            expense,
        });

        if (expense > 0) {
            const userRows = await db.select().from(users).where(eq(users.id, userId));
            if (userRows.length > 0) {
                const currentSpent = userRows[0].totalSpent || 0;
                await db.update(users)
                    .set({ totalSpent: currentSpent + expense })
                    .where(eq(users.id, userId));
            }
        }

        revalidatePath('/meals');
        revalidatePath('/');

        return { success: true };
    } catch (error) {
        console.error("Failed to add meal:", error);
        return { error: "食事の記録に失敗しました" };
    }
}

export async function deleteMeal(id: string) {
    try {
        const userId = await getRequiredSession();
        const { env } = await getCloudflareContext({ async: true });
        const db = createDb(env.DB);

        // 削除対象の食事を取得
        const existingMeals = await db.select().from(meals).where(and(eq(meals.id, id), eq(meals.userId, userId)));
        if (existingMeals.length === 0) {
            return { error: "対象の食事記録が見つかりません" };
        }

        const expense = existingMeals[0].expense || 0;

        // 削除
        await db.delete(meals).where(and(eq(meals.id, id), eq(meals.userId, userId)));

        // 支出の減算
        if (expense > 0) {
            const userRows = await db.select().from(users).where(eq(users.id, userId));
            if (userRows.length > 0) {
                const currentSpent = userRows[0].totalSpent || 0;
                await db.update(users)
                    .set({ totalSpent: Math.max(0, currentSpent - expense) })
                    .where(eq(users.id, userId));
            }
        }

        revalidatePath('/meals');
        revalidatePath('/');

        return { success: true };
    } catch (error) {
        console.error("Failed to delete meal:", error);
        return { error: "食事記録の削除に失敗しました" };
    }
}

export async function editMealName(id: string, newName: string) {
    if (!newName || newName.trim() === '') {
        return { error: "タイトルが入力されていません" };
    }

    try {
        const userId = await getRequiredSession();
        const { env } = await getCloudflareContext({ async: true });
        const db = createDb(env.DB);

        await db.update(meals)
            .set({ name: newName })
            .where(and(eq(meals.id, id), eq(meals.userId, userId)));

        revalidatePath(`/meals/${id}`);
        revalidatePath('/meals');
        revalidatePath('/');

        return { success: true };
    } catch (error) {
        console.error("Failed to update meal name:", error);
        return { error: "タイトルの更新に失敗しました" };
    }
}
