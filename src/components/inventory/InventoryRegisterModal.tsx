'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { addInventoryItem } from '@/actions/inventory';

export default function InventoryRegisterModal({ emptyState = false }: { emptyState?: boolean }) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (searchParams.get('action') === 'register') {
            setIsOpen(true);
            // URLからパラメータを削除して、リロード時に再度開かないようにする（任意）
            // router.replace('/inventory');
        }
    }, [searchParams]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(formData: FormData) {
        setIsSubmitting(true);
        setError(null);

        try {
            const result = await addInventoryItem(formData);

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
                    className="bg-green-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-green-700 transition shadow-sm"
                >
                    ＋ 追加
                </button>
            )}

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                    <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h2 className="text-xl font-bold text-gray-900">在庫の追加</h2>
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
                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-gray-900 font-bold"
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
                                            step="1"
                                            min="1"
                                            required
                                            placeholder="例: 1"
                                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-gray-900 font-bold"
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
                                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-gray-900 font-bold"
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
                                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-white text-gray-900 font-bold"
                                        >
                                            <option value="">選択なし</option>
                                            <option value="食品">食品</option>
                                            <option value="日用品">日用品</option>
                                            <option value="調味料">調味料</option>
                                            <option value="その他">その他</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="price" className="block text-sm font-bold text-gray-700 mb-1">
                                            価格（任意）
                                        </label>
                                        <input
                                            type="number"
                                            id="price"
                                            name="price"
                                            min="0"
                                            placeholder="例: 200"
                                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition text-gray-900 font-bold"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`mt-2 text-white font-bold text-lg px-6 py-4 rounded-xl transition shadow-sm w-full ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
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
