import { getCloudflareContext } from '@opennextjs/cloudflare';
import { createDb } from '@/db';
import { inventoryItems, shoppingListItems, recipes, meals } from '@/db/schema';
import { count, eq } from 'drizzle-orm';
import Link from 'next/link';

// Next.jsのキャッシュを無効化して常に最新データを取得する
export const dynamic = 'force-dynamic';

const DUMMY_USER_ID = 'dummy-user-123';

export default async function DashboardPage() {
	let inventoryCount = 0;
	let shoppingCount = 0;
	let recipeCount = 0;
	let mealsCount = 0;

	try {
		// OpenNext Cloudflare のコンテキストからバインディングを取得
		const { env } = await getCloudflareContext({ async: true });
		const d1 = env.DB;
		const db = createDb(d1);

		// 各テーブルのレコード数を取得
		const [invResult] = await db.select({ value: count() }).from(inventoryItems).where(eq(inventoryItems.userId, DUMMY_USER_ID));
		const [shopResult] = await db.select({ value: count() }).from(shoppingListItems).where(eq(shoppingListItems.userId, DUMMY_USER_ID));
		const [recResult] = await db.select({ value: count() }).from(recipes).where(eq(recipes.userId, DUMMY_USER_ID));
		const [mealResult] = await db.select({ value: count() }).from(meals).where(eq(meals.userId, DUMMY_USER_ID));

		inventoryCount = invResult.value;
		shoppingCount = shopResult.value;
		recipeCount = recResult.value;
		mealsCount = mealResult.value;

	} catch (error) {
		console.error("Failed to fetch dashboard summaries:", error);
	}

	return (
		<main className="p-6">
			<header className="mb-8 mt-4">
				<h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">ダッシュボード</h1>
				<p className="text-gray-500 mt-2 text-sm">現在の状況サマリー</p>
			</header>

			<div className="grid grid-cols-2 gap-4">
				{/* 買い物リスト サマリー */}
				<Link href="/shopping" className="block focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-2xl">
					<div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow h-full">
						<div className="flex items-center justify-between mb-3">
							<span className="text-2xl">🛒</span>
						</div>
						<h2 className="text-sm font-semibold text-orange-900 mb-1">買い物リスト</h2>
						<p className="text-3xl font-bold text-orange-600">{shoppingCount}<span className="text-sm font-normal text-orange-800 ml-1">件</span></p>
					</div>
				</Link>

				{/* 在庫 サマリー */}
				<Link href="/inventory" className="block focus:outline-none focus:ring-2 focus:ring-green-500 rounded-2xl">
					<div className="bg-green-50 border border-green-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow h-full">
						<div className="flex items-center justify-between mb-3">
							<span className="text-2xl">📦</span>
						</div>
						<h2 className="text-sm font-semibold text-green-900 mb-1">現在の在庫</h2>
						<p className="text-3xl font-bold text-green-600">{inventoryCount}<span className="text-sm font-normal text-green-800 ml-1">件</span></p>
					</div>
				</Link>

				{/* レシピ サマリー */}
				<Link href="/recipes" className="block focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-2xl">
					<div className="bg-purple-50 border border-purple-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow h-full">
						<div className="flex items-center justify-between mb-3">
							<span className="text-2xl">🍳</span>
						</div>
						<h2 className="text-sm font-semibold text-purple-900 mb-1">登録レシピ</h2>
						<p className="text-3xl font-bold text-purple-600">{recipeCount}<span className="text-sm font-normal text-purple-800 ml-1">件</span></p>
					</div>
				</Link>

				{/* 食事記録 サマリー */}
				<Link href="/meals" className="block focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-2xl">
					<div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow h-full">
						<div className="flex items-center justify-between mb-3">
							<span className="text-2xl">🍽️</span>
						</div>
						<h2 className="text-sm font-semibold text-blue-900 mb-1">食事記録</h2>
						<p className="text-3xl font-bold text-blue-600">{mealsCount}<span className="text-sm font-normal text-blue-800 ml-1">回</span></p>
					</div>
				</Link>
			</div>

			{/* クイックアクション等のセクションを追加可能 */}
			<section className="mt-10">
				<h3 className="text-lg font-bold text-gray-800 mb-4">クイックアクション</h3>
				<div className="flex flex-col gap-3">
					<Link href="/inventory/register" className="flex items-center justify-center gap-2 w-full bg-gray-900 text-white font-medium py-3 rounded-xl hover:bg-gray-800 transition-colors">
						<span>＋ 新しい在庫を追加</span>
					</Link>
					<Link href="/meals/new" className="flex items-center justify-center gap-2 w-full bg-white border border-gray-300 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-50 transition-colors">
						<span>📝 食事を記録する</span>
					</Link>
				</div>
			</section>
		</main>
	);
}
