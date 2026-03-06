'use server';

import { createDb } from '@/db';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { recipes, recipeIngredients } from '@/db/schema';
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

export async function getRecipes() {
    try {
        const userId = await getRequiredSession();
        const { env } = await getCloudflareContext({ async: true });
        const db = createDb(env.DB);

        return await db.select().from(recipes).where(eq(recipes.userId, userId)).orderBy(desc(recipes.createdAt));
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

// サーバーアクション: 料理の追加
export async function addRecipe(formData: FormData) {
    const name = formData.get('name') as string;

    if (!name) {
        return { error: "料理名が入力されていません" };
    }

    try {
        const userId = await getRequiredSession();
        const { env } = await getCloudflareContext({ async: true });
        const db = createDb(env.DB);

        await db.insert(recipes).values({
            id: crypto.randomUUID(),
            userId: userId,
            name,
        });

        revalidatePath('/recipes');
        revalidatePath('/');

        return { success: true };
    } catch (error) {
        console.error("Failed to add recipe:", error);
        return { error: "料理の追加に失敗しました" };
    }
}

// サーバーアクション: 料理への材料追加
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

export async function deleteRecipe(id: string) {
    try {
        const userId = await getRequiredSession();
        const { env } = await getCloudflareContext({ async: true });
        const db = createDb(env.DB);

        // レシピを削除（recipeIngredientsは外部キー制約 onDelete: 'cascade' により自動削除される）
        await db.delete(recipes).where(and(eq(recipes.id, id), eq(recipes.userId, userId)));

        revalidatePath('/recipes');
        revalidatePath('/');

        return { success: true };
    } catch (error) {
        console.error("Failed to delete recipe:", error);
        return { error: "料理の削除に失敗しました" };
    }
}

export async function editRecipeName(id: string, newName: string) {
    if (!newName || newName.trim() === '') {
        return { error: "タイトルが入力されていません" };
    }

    try {
        const userId = await getRequiredSession();
        const { env } = await getCloudflareContext({ async: true });
        const db = createDb(env.DB);

        await db.update(recipes)
            .set({ name: newName })
            .where(and(eq(recipes.id, id), eq(recipes.userId, userId)));

        revalidatePath(`/recipes/${id}`);
        revalidatePath('/recipes');
        revalidatePath('/');

        return { success: true };
    } catch (error) {
        console.error("Failed to update recipe name:", error);
        return { error: "料理名の更新に失敗しました" };
    }
}
