'use server';

import { createDb } from '@/db';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { recipes, recipeIngredients } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

const DUMMY_USER_ID = 'dummy-user-123';

export async function getRecipes() {
    try {
        const { env } = await getCloudflareContext({ async: true });
        const db = createDb(env.DB);

        return await db.select().from(recipes).where(eq(recipes.userId, DUMMY_USER_ID)).orderBy(desc(recipes.createdAt));
    } catch (error) {
        console.error("Failed to fetch recipes:", error);
        return [];
    }
}

export async function getRecipe(id: string) {
    try {
        const { env } = await getCloudflareContext({ async: true });
        const db = createDb(env.DB);

        const result = await db.select().from(recipes).where(eq(recipes.id, id));
        return result.length > 0 ? result[0] : null;
    } catch (error) {
        console.error("Failed to fetch recipe details:", error);
        return null;
    }
}

export async function getRecipeIngredients(recipeId: string) {
    try {
        const { env } = await getCloudflareContext({ async: true });
        const db = createDb(env.DB);

        return await db.select().from(recipeIngredients).where(eq(recipeIngredients.recipeId, recipeId));
    } catch (error) {
        console.error("Failed to fetch recipe ingredients:", error);
        return [];
    }
}

// サーバーアクション: レシピの追加
export async function addRecipe(formData: FormData) {
    const name = formData.get('name') as string;

    if (!name) {
        return { error: "レシピ名が入力されていません" };
    }

    try {
        const { env } = await getCloudflareContext({ async: true });
        const db = createDb(env.DB);

        await db.insert(recipes).values({
            id: crypto.randomUUID(),
            userId: DUMMY_USER_ID,
            name,
        });

        revalidatePath('/recipes');
        revalidatePath('/');

        return { success: true };
    } catch (error) {
        console.error("Failed to add recipe:", error);
        return { error: "レシピの追加に失敗しました" };
    }
}

// サーバーアクション: レシピへの材料追加
export async function addRecipeIngredient(formData: FormData) {
    const recipeId = formData.get('recipeId') as string;
    const name = formData.get('name') as string;
    const quantityStr = formData.get('quantity') as string;

    if (!recipeId || !name || !quantityStr) {
        return { error: "必須項目が入力されていません" };
    }

    const quantity = parseFloat(quantityStr);

    try {
        const { env } = await getCloudflareContext({ async: true });
        const db = createDb(env.DB);

        await db.insert(recipeIngredients).values({
            id: crypto.randomUUID(),
            recipeId,
            name,
            quantity,
            unit: (formData.get('unit') as string) || '個',
        });

        revalidatePath(`/recipes/${recipeId}`);

        return { success: true };
    } catch (error) {
        console.error("Failed to add recipe ingredient:", error);
        return { error: "材料の追加に失敗しました" };
    }
}
