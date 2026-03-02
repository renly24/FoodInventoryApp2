'use client';

import { useState, useTransition } from 'react';
import ShoppingItemCheckbox from './ShoppingItemCheckbox';
import { updateShoppingItem, deleteShoppingItem } from '@/actions/shopping';

export default function ShoppingItemRow({ item }: { item: any }) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, startDeletionTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    async function handleUpdate(formData: FormData) {
        setIsSubmitting(true);
        setError(null);

        try {
            const result = await updateShoppingItem(item.id, formData);

            if (result?.error) {
                setError(result.error);
            } else {
                setIsEditModalOpen(false);
            }
        } catch (e) {
            setError("予期せぬエラーが発生しました");
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleDelete = () => {
        if (confirm('本当にこのアイテムを削除しますか？')) {
            startDeletionTransition(async () => {
                await deleteShoppingItem(item.id);
                setIsEditModalOpen(false);
            });
        }
    };

    return (
        <>
            <div
                onClick={() => setIsEditModalOpen(true)}
                className="cursor-pointer p-4 border border-orange-200 rounded-2xl shadow-sm hover:shadow-md hover:border-orange-400 transition-all bg-white flex justify-between items-center w-full relative overflow-hidden group"
            >
                {item.isPurchased && (
                    <div className="absolute inset-0 bg-white/60 z-10 pointer-events-none"></div>
                )}
                <div className="flex-1 relative z-20 flex items-start gap-3">
                    <div className="mt-1">
                        <ShoppingItemCheckbox item={item} />
                    </div>
                    <div className="flex-1 block py-1">
                        <h2 className={`font-bold text-lg group-hover:text-orange-600 transition-colors ${item.isPurchased ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                            {item.name}
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                            {item.category && (
                                <span className="inline-block text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-md font-medium">
                                    {item.category}
                                </span>
                            )}
                            {item.expectedPrice && (
                                <span className="text-xs text-gray-500 font-medium">想定: ¥{item.expectedPrice}</span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="text-right pl-4 pr-1 relative z-20 pointer-events-none">
                    <p className={`text-2xl font-black ${item.isPurchased ? 'text-gray-400' : 'text-orange-600'}`}>
                        {item.quantity}
                    </p>
                    <p className="text-xs text-gray-400 font-medium mt-0.5">{item.unit}</p>
                </div>
            </div>

            {/* 編集用モーダル */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h2 className="text-xl font-bold text-gray-900">アイテムの編集</h2>
                            <button
                                type="button"
                                onClick={() => setIsEditModalOpen(false)}
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

                            <form action={handleUpdate} className="flex flex-col gap-4">
                                <div>
                                    <label htmlFor={`name-${item.id}`} className="block text-sm font-bold text-gray-700 mb-1">
                                        アイテム名 <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id={`name-${item.id}`}
                                        name="name"
                                        defaultValue={item.name}
                                        required
                                        placeholder="例: 牛乳、卵"
                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition text-gray-900"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor={`quantity-${item.id}`} className="block text-sm font-bold text-gray-700 mb-1">
                                            数量 <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            id={`quantity-${item.id}`}
                                            name="quantity"
                                            defaultValue={item.quantity}
                                            step="0.1"
                                            min="0"
                                            required
                                            placeholder="例: 1"
                                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition text-gray-900"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor={`unit-${item.id}`} className="block text-sm font-bold text-gray-700 mb-1">
                                            単位
                                        </label>
                                        <input
                                            type="text"
                                            id={`unit-${item.id}`}
                                            name="unit"
                                            defaultValue={item.unit}
                                            placeholder="例: 個, g"
                                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition text-gray-900"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor={`category-${item.id}`} className="block text-sm font-bold text-gray-700 mb-1">
                                            カテゴリ
                                        </label>
                                        <select
                                            id={`category-${item.id}`}
                                            name="category"
                                            defaultValue={item.category || ""}
                                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition bg-white text-gray-900"
                                        >
                                            <option value="">選択なし</option>
                                            <option value="食品">食品</option>
                                            <option value="日用品">日用品</option>
                                            <option value="調味料">調味料</option>
                                            <option value="その他">その他</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor={`expectedPrice-${item.id}`} className="block text-sm font-bold text-gray-700 mb-1">
                                            予定価格（任意）
                                        </label>
                                        <input
                                            type="number"
                                            id={`expectedPrice-${item.id}`}
                                            name="expectedPrice"
                                            defaultValue={item.expectedPrice || ""}
                                            min="0"
                                            placeholder="例: 200"
                                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition text-gray-900"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor={`memo-${item.id}`} className="block text-sm font-bold text-gray-700 mb-1">
                                        メモ（任意）
                                    </label>
                                    <textarea
                                        id={`memo-${item.id}`}
                                        name="memo"
                                        defaultValue={item.memo || ""}
                                        rows={2}
                                        placeholder="特記事項があれば入力"
                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition text-gray-900 resize-none"
                                    ></textarea>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-2">
                                    <button
                                        type="button"
                                        onClick={handleDelete}
                                        disabled={isDeleting || isSubmitting}
                                        className={`px-4 py-4 rounded-xl font-bold transition shadow-sm border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 ${(isDeleting || isSubmitting) ? 'opacity-50 cursor-not-allowed' : ''
                                            }`}
                                    >
                                        {isDeleting ? '削除中...' : '削除'}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isDeleting || isSubmitting}
                                        className={`text-white font-bold px-4 py-4 rounded-xl transition shadow-sm ${(isDeleting || isSubmitting) ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700'
                                            }`}
                                    >
                                        {isSubmitting ? '保存中...' : '保存'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
