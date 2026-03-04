import { getMeal } from '@/actions/meals';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function MealDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const meal = await getMeal(resolvedParams.id);

    if (!meal) {
        notFound();
    }

    // Format the date
    const date = new Date(meal.date);
    const dateStr = date.toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' });

    return (
        <main className="p-6">
            <div className="mb-6 mx-4 mt-4">
                <Link href="/meals" className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center mb-4">
                    <span>← 食事・外食一覧へ戻る</span>
                </Link>
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-extrabold text-purple-900 tracking-tight">{meal.name}</h1>
                        <p className="text-purple-600 mt-1 text-sm font-medium">食事記録の詳細</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-purple-100 overflow-hidden mb-8 mx-4">
                <div className="p-6 border-b border-purple-50 flex justify-between items-center bg-purple-50/50">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <span>🍽️</span> 詳細情報
                    </h2>
                </div>

                <div className="p-6">
                    <ul className="divide-y divide-purple-50">
                        <li className="py-4 flex justify-between items-center">
                            <span className="font-bold text-gray-500">日付</span>
                            <span className="font-bold text-gray-900 text-lg">{dateStr}</span>
                        </li>
                        <li className="py-4 flex justify-between items-center">
                            <span className="font-bold text-gray-500">支出額</span>
                            <div className="text-right">
                                <span className={`text-2xl font-black mr-1 ${(meal.expense ?? 0) > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                                    {(meal.expense ?? 0) > 0 ? `¥${(meal.expense ?? 0).toLocaleString()}` : '記録なし'}
                                </span>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </main>
    );
}
