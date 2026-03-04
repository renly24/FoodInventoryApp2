import { getMeals } from '@/actions/meals';
import Link from 'next/link';
import MealRegisterModal from '@/components/meals/MealRegisterModal';
import ReceiptScannerModal from '@/components/inventory/ReceiptScannerModal';

export const dynamic = 'force-dynamic';

export default async function MealsPage() {
    const mealsList = await getMeals();

    // Map by date (simple grouping for demonstration)
    const groupByDate = mealsList.reduce((acc: Record<string, typeof mealsList>, meal) => {
        const dateStr = new Date(meal.date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', weekday: 'short' });
        if (!acc[dateStr]) acc[dateStr] = [];
        acc[dateStr].push(meal);
        return acc;
    }, {} as Record<string, typeof mealsList>);

    return (
        <main className="p-6">
            <div className="flex justify-between items-center mb-6 mt-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight">食事記録</h1>
                    <p className="text-blue-600 mt-1 text-sm font-medium">食べたものを記録</p>
                </div>
                <div className="flex items-center gap-2">
                    <ReceiptScannerModal triggerType="icon" mode="meal" />
                    <MealRegisterModal />
                </div>
            </div>

            {mealsList.length === 0 ? (
                <div className="bg-blue-50 p-10 text-center rounded-2xl shadow-sm border border-blue-100 mt-8">
                    <span className="text-5xl mb-4 block">🍽️</span>
                    <p className="text-blue-800 font-medium mb-4">まだ食事情報がありません</p>
                    <div className="flex flex-col gap-3 max-w-xs mx-auto">
                        <MealRegisterModal emptyState={true} />
                        <ReceiptScannerModal triggerType="full" mode="meal" />
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-6 pb-8">
                    {Object.entries(groupByDate).map(([date, mealsForDate]) => (
                        <div key={date}>
                            <h2 className="text-sm font-bold text-gray-500 mb-3 px-1">{date}</h2>
                            <div className="flex flex-col gap-3">
                                {mealsForDate.map(meal => (
                                    <Link href={`/meals/${meal.id}`} key={meal.id} className="block group focus:outline-none">
                                        <div className="p-4 border border-blue-100 rounded-2xl shadow-sm group-hover:shadow-md group-hover:border-blue-300 transition-all bg-white flex items-center justify-between w-full">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-blue-50 w-10 h-10 rounded-full flex items-center justify-center text-blue-500 text-lg">
                                                    🥣
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg text-gray-900">{meal.name}</h3>
                                                    <p className="text-xs text-gray-400 font-medium">{new Date(meal.date).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 text-right">
                                                {meal.expense > 0 && (
                                                    <span className="font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg text-sm border border-red-100">
                                                        ¥{meal.expense.toLocaleString()}
                                                    </span>
                                                )}
                                                <div className="text-gray-400 group-hover:text-blue-500 transition-colors">
                                                    ›
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}
