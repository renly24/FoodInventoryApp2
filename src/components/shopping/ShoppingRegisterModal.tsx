'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { addShoppingItem } from '@/actions/shopping';

export default function ShoppingRegisterModal({ emptyState = false }: { emptyState?: boolean }) {
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
            const result = await addShoppingItem(formData);

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
                    最初のアイテムを登録
                </button>
            ) : (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-purple-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-purple-700 transition shadow-sm"
                >
                    ＋ 追加
                </button>
            )}

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h2 className="text-xl font-bold text-gray-900">買い物リストに追加</h2>
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
                                        アイテム名 <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        required
                                        placeholder="例: 牛乳、卵"
                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-gray-900"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="quantity" className="block text-sm font-bold text-gray-700 mb-1">
                                            数量 <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            id="quantity"
                                            name="quantity"
                                            step="0.1"
                                            min="0"
                                            required
                                            placeholder="例: 1"
                                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-gray-900"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="unit" className="block text-sm font-bold text-gray-700 mb-1">
                                            単位
                                        </label>
                                        <input
                                            type="text"
                                            id="unit"
                                            name="unit"
                                            defaultValue="個"
                                            placeholder="例: 個, g"
                                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-gray-900"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="category" className="block text-sm font-bold text-gray-700 mb-1">
                                            カテゴリ
                                        </label>
                                        <select
                                            id="category"
                                            name="category"
                                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition bg-white text-gray-900"
                                        >
                                            <option value="">選択なし</option>
                                            <option value="食品">食品</option>
                                            <option value="日用品">日用品</option>
                                            <option value="調味料">調味料</option>
                                            <option value="その他">その他</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="expectedPrice" className="block text-sm font-bold text-gray-700 mb-1">
                                            予定価格（任意）
                                        </label>
                                        <input
                                            type="number"
                                            id="expectedPrice"
                                            name="expectedPrice"
                                            min="0"
                                            placeholder="例: 200"
                                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-gray-900"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="memo" className="block text-sm font-bold text-gray-700 mb-1">
                                        メモ（任意）
                                    </label>
                                    <textarea
                                        id="memo"
                                        name="memo"
                                        rows={2}
                                        placeholder="特記事項があれば入力"
                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-gray-900 resize-none"
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`mt-2 text-white font-bold text-lg px-6 py-4 rounded-xl transition shadow-sm w-full ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
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
