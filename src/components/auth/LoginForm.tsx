'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function LoginForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const isRegistered = searchParams.get('registered') === 'true';

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        setError(null);

        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError('メールアドレスまたはパスワードが正しくありません');
            } else {
                router.push('/');
                router.refresh();
            }
        } catch (e) {
            setError('エラーが発生しました');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form action={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm mx-auto p-2">
            {isRegistered && (
                <div className="bg-green-50 text-green-700 text-sm font-bold p-4 rounded-xl border border-green-100 mb-2 animate-pulse">
                    アカウントを作成しました。ログインしてください。
                </div>
            )}

            <div className="space-y-1">
                <input
                    name="email"
                    type="email"
                    required
                    placeholder="メールアドレス"
                    className="w-full px-5 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-gray-50/50 text-gray-900 font-bold"
                />
            </div>

            <div className="space-y-1">
                <input
                    name="password"
                    type="password"
                    required
                    placeholder="パスワード"
                    className="w-full px-5 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-gray-50/50 text-gray-900 font-bold"
                />
            </div>

            {error && (
                <p className="text-red-500 text-xs font-medium text-center italic">
                    {error}
                </p>
            )}

            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 transition-all shadow-lg active:scale-95 disabled:opacity-50"
            >
                {isLoading ? 'ログイン中...' : 'ログイン'}
            </button>
        </form>
    );
}
