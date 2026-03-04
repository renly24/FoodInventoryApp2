'use server';

import { createDb } from '@/db';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { z } from 'zod';
import { hash } from 'bcryptjs';

const SignUpSchema = z.object({
    name: z.string().min(1, "名前を入力してください"),
    email: z.string().email("有効なメールアドレスを入力してください"),
    password: z.string().min(6, "パスワードは6文字以上で入力してください"),
});

async function getRequiredSession() {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("認証が必要です");
    }
    return session.user.id;
}

// ユーザー情報の取得
export async function getProfile() {
    try {
        const userId = await getRequiredSession();
        const { env } = await getCloudflareContext({ async: true });
        const db = createDb(env.DB);

        const results = await db.select().from(users).where(eq(users.id, userId));
        if (results.length === 0) {
            return null;
        }
        return results[0];
    } catch (error) {
        console.error("Failed to fetch user profile:", error);
        return null;
    }
}


// 使用額のリセット（月次等）
export async function resetSpent() {
    try {
        const userId = await getRequiredSession();
        const { env } = await getCloudflareContext({ async: true });
        const db = createDb(env.DB);

        await db.update(users)
            .set({ totalSpent: 0 })
            .where(eq(users.id, userId));

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
        const userId = await getRequiredSession();
        const { env } = await getCloudflareContext({ async: true });
        const db = createDb(env.DB);

        await db.update(users)
            .set({ totalSpent: spent })
            .where(eq(users.id, userId));

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error("Failed to update spent:", error);
        return { error: "支出額の更新に失敗しました" };
    }
}

// ユーザー登録
export async function signUp(formData: FormData) {
    try {
        const validatedFields = SignUpSchema.safeParse(Object.fromEntries(formData));

        if (!validatedFields.success) {
            return { error: validatedFields.error.flatten().fieldErrors };
        }

        const { name, email, password } = validatedFields.data;
        const hashedPassword = await hash(password, 10);

        const { env } = await getCloudflareContext({ async: true });
        const db = createDb(env.DB);

        // 既存ユーザーの確認
        const existingUsers = await db.select().from(users).where(eq(users.email, email));
        if (existingUsers.length > 0) {
            return { error: "このメールアドレスは既に登録されています" };
        }

        // ユーザー作成
        await db.insert(users).values({
            id: crypto.randomUUID(),
            name,
            email,
            password: hashedPassword,
        });

        return { success: true };
    } catch (error) {
        console.error("Failed to sign up:", error);
        return { error: "ユーザー登録に失敗しました" };
    }
}
