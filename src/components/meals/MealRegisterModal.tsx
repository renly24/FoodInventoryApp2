'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { addMeal } from '@/actions/meals';

export default function MealRegisterModal({ emptyState = false }: { emptyState?: boolean }) {
    const searchParams = useSearchParams();
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (searchParams.get('action') === 'register') {
            setIsOpen(true);
        }
    }, [searchParams]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(formData: FormData) {
        setIsSubmitting(true);
        setError(null);

        try {
            const result = await addMeal(formData);

            if (result?.error) {
                setError(result.error);
            } else {
                setIsOpen(false);
            }
        } catch (e) {
            setError("予期せぬエラーが発生しました");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <>
            {emptyState ? (
                <button
                    onClick={() => setIsOpen(true)}
                    className="inline-block bg-gray-900 text-white font-medium px-6 py-3 rounded-xl hover:bg-gray-800 transition"
                >
                    最初の食事を記録
                </button>
            ) : (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-red-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-red-700 transition shadow-sm"
                >
                    ＋ 追加
                </button>
            )}

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                    <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h2 className="text-xl font-bold text-gray-900">食事の記録</h2>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-gray-600 p-2 -mr-2 rounded-full hover:bg-gray-100 transition"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            {error && (
                                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
                                    {error}
                                </div>
                            )}

                            <form action={handleSubmit} className="flex flex-col gap-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-1">
                                        食事の内容 <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        required
                                        placeholder="例: 肉じゃが定食"
                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition text-gray-900"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="date" className="block text-sm font-bold text-gray-700 mb-1">
                                        日時 <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="datetime-local"
                                        id="date"
                                        name="date"
                                        defaultValue={new Date().toISOString().slice(0, 16)}
                                        required
                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition text-gray-900"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`mt-6 text-white font-bold text-lg px-6 py-4 rounded-xl transition shadow-sm w-full ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
                                        }`}
                                >
                                    {isSubmitting ? '登録中...' : '登録する'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
