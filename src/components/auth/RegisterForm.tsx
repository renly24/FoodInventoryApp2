'use client';

import { useState } from 'react';
import { signUp } from '@/actions/users';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        setError(null);

        try {
            const result = await signUp(formData);
            if (result.error) {
                if (typeof result.error === 'string') {
                    setError(result.error);
                } else {
                    setError('入力内容を確認してください');
                }
            } else {
                router.push('/login?registered=true');
            }
        } catch (e) {
            setError('エラーが発生しました');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form action={handleSubmit} className="flex flex-col gap-5 w-full max-w-sm mx-auto">
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">お名前</label>
                <input
                    name="name"
                    type="text"
                    required
                    placeholder="山田 太郎"
                    className="w-full px-5 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50/50 text-gray-900 font-bold"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">メールアドレス</label>
                <input
                    name="email"
                    type="email"
                    required
                    placeholder="example@mail.com"
                    className="w-full px-5 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50/50 text-gray-900 font-bold"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">パスワード</label>
                <input
                    name="password"
                    type="password"
                    required
                    placeholder="6文字以上のパスワード"
                    className="w-full px-5 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-100 text-gray-900 font-bold"
                />
            </div>

            {error && (
                <p className="text-red-500 text-sm font-medium text-center bg-red-50 py-2 rounded-xl border border-red-100 italic">
                    {error}
                </p>
            )}

            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:active:scale-100"
            >
                {isLoading ? '登録中...' : 'アカウントを作成する'}
            </button>

            <p className="text-center text-gray-500 text-sm mt-2">
                既にアカウントをお持ちですか？{' '}
                <Link href="/" className="text-blue-600 font-bold hover:underline">
                    ログイン
                </Link>
            </p>
        </form>
    );
}
