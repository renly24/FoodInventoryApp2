'use server';

import { createDb } from '@/db';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { meals } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
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

// サーバーアクション: 食事記録の追加
export async function addMeal(formData: FormData) {
    const name = formData.get('name') as string;
    const dateStr = formData.get('date') as string;

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
        });

        revalidatePath('/meals');
        revalidatePath('/');

        return { success: true };
    } catch (error) {
        console.error("Failed to add meal:", error);
        return { error: "食事の記録に失敗しました" };
    }
}
