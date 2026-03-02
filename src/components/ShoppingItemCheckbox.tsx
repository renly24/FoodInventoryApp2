'use client';

import { useState, useTransition } from 'react';
import { toggleShoppingItem, purchaseShoppingItem } from '@/actions/shopping';

export default function ShoppingItemCheckbox({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    item
}: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    item: any;
}) {
    const [isPending, startTransition] = useTransition();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (item.isPurchased) {
            startTransition(async () => {
                await toggleShoppingItem(item.id, false);
            });
        } else {
            setIsModalOpen(true);
        }
    };

    async function handlePurchase(formData: FormData) {
        setIsSubmitting(true);
        setError(null);
        try {
            const result = await purchaseShoppingItem(item.id, formData);
            if (result?.error) {
                setError(result.error);
            } else {
                setIsModalOpen(false);
            }
        } catch (e) {
            setError("予期せぬエラーが発生しました");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <>
            <button
                onClick={handleToggle}
                disabled={isPending}
                className={`w-6 h-6 rounded flex-shrink-0 flex items-center justify-center border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 z-30 relative ${item.isPurchased
                    ? 'bg-orange-500 border-orange-500 opacity-80 hover:opacity-100'
                    : 'border-gray-300 hover:border-orange-400 bg-white'
                    }`}
                aria-label={item.isPurchased ? "未購入に戻す" : "購入して在庫に追加"}
            >
                {item.isPurchased && <span className="text-white text-xs font-bold leading-none select-none">✓</span>}
            </button>

            {isModalOpen && (
                <div onClick={(e) => e.stopPropagation()} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm cursor-default">
                    <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-orange-50/50">
                            <h2 className="text-xl font-bold text-gray-900">在庫に追加</h2>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 p-2 -mr-2 rounded-full hover:bg-gray-100 transition"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-6">
                            {error && (
                                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
                                    {error}
                                </div>
                            )}
                            <p className="text-gray-600 mb-4 text-sm font-medium">
                                <span className="font-bold text-gray-900">{item.name}</span> を購入済みにし、在庫に追加します。購入数と価格を入力してください。
                            </p>
                            <form action={handlePurchase} className="flex flex-col gap-4">
                                <div>
                                    <label htmlFor={`actualQuantity-${item.id}`} className="block text-sm font-bold text-gray-700 mb-1">
                                        購入数 ({item.unit}) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        id={`actualQuantity-${item.id}`}
                                        name="actualQuantity"
                                        defaultValue={item.quantity}
                                        step="0.5"
                                        min="0"
                                        required
                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition text-gray-900"
                                    />
                                </div>
                                <div>
                                    <label htmlFor={`actualPrice-${item.id}`} className="block text-sm font-bold text-gray-700 mb-1">
                                        実際の単価（任意）
                                    </label>
                                    <input
                                        type="number"
                                        id={`actualPrice-${item.id}`}
                                        name="actualPrice"
                                        defaultValue={item.expectedPrice || ""}
                                        min="0"
                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition text-gray-900"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`mt-4 text-white font-bold px-4 py-4 rounded-xl transition shadow-sm ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700'
                                        }`}
                                >
                                    {isSubmitting ? '処理中...' : '購入して在庫に追加'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
