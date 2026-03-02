import { getCloudflareContext } from '@opennextjs/cloudflare';
import { createDb } from '@/db';
import { inventoryItems, shoppingListItems, recipes, meals } from '@/db/schema';
import { count, eq } from 'drizzle-orm';
import Link from 'next/link';
import { getProfile } from '@/actions/users';
import { auth } from '@/auth';
import { SignIn } from '@/components/auth/AuthButtons';
import LoginForm from '@/components/auth/LoginForm';

// Next.jsのキャッシュを無効化して常に最新データを取得する
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
	const session = await auth();

	if (!session?.user) {
		return (
			<main className="p-6 flex flex-col items-center justify-center min-h-[90vh] bg-white">
				<div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
					<div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[2.5rem] flex items-center justify-center text-white mx-auto shadow-2xl ring-8 ring-blue-50 mb-8 transform hover:scale-105 transition-transform duration-500">
						<span className="text-5xl drop-shadow-lg">🥦</span>
					</div>
					<h1 className="text-4xl font-black text-gray-900 tracking-tighter mb-3">Food Inventory</h1>
					<p className="text-gray-500 font-medium">スマートな在庫管理でフードロスを削減</p>
				</div>

				<div className="w-full max-w-sm space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-1000">
					<LoginForm />

					<div className="relative">
						<div className="absolute inset-0 flex items-center">
							<span className="w-full border-t border-gray-100"></span>
						</div>
						<div className="relative flex justify-center text-xs uppercase">
							<span className="bg-white px-4 text-gray-400 font-bold tracking-widest">または</span>
						</div>
					</div>

					<div className="space-y-4">
						<SignIn
							provider="github"
							className="w-full bg-[#24292f] text-white font-bold py-4 px-8 rounded-2xl hover:bg-[#1b1f23] transition-all flex items-center justify-center gap-3 active:scale-95 shadow-lg"
						>
							<svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
								<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.041-1.416-4.041-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
							</svg>
							GitHubアカウントでログイン
						</SignIn>

						<div className="text-center pt-4">
							<p className="text-gray-400 text-sm font-medium">
								はじめての方はこちら
							</p>
							<Link
								href="/register"
								className="mt-2 inline-block text-blue-600 font-black text-lg hover:text-blue-700 transition-colors"
							>
								無料アカウントを作成
							</Link>
						</div>
					</div>
				</div>

				<div className="mt-20 text-gray-300 text-[10px] font-bold tracking-[0.2em] uppercase">
					&copy; 2024 Food Inventory App
				</div>
			</main>
		);
	}

	const userId = session.user.id!;
	let inventoryCount = 0;
	let shoppingCount = 0;
	let recipeCount = 0;
	let mealsCount = 0;
	let userProfile: any = null;

	try {
		userProfile = await getProfile();

		// OpenNext Cloudflare のコンテキストからバインディングを取得
		const { env } = await getCloudflareContext({ async: true });
		const d1 = env.DB;
		const db = createDb(d1);

		// 各テーブルのレコード数を取得
		const [invResult] = await db.select({ value: count() }).from(inventoryItems).where(eq(inventoryItems.userId, userId));
		const [shopResult] = await db.select({ value: count() }).from(shoppingListItems).where(eq(shoppingListItems.userId, userId));
		const [recResult] = await db.select({ value: count() }).from(recipes).where(eq(recipes.userId, userId));
		const [mealResult] = await db.select({ value: count() }).from(meals).where(eq(meals.userId, userId));

		inventoryCount = invResult.value;
		shoppingCount = shopResult.value;
		recipeCount = recResult.value;
		mealsCount = mealResult.value;

	} catch (error) {
		console.error("Failed to fetch dashboard summaries:", error);
	}

	return (
		<main className="p-6">
			<header className="mb-6 mt-4 flex items-start justify-between">
				<div>
					<h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">ダッシュボード</h1>
					<p className="text-gray-500 mt-2 text-sm">現在の状況サマリー</p>
				</div>
				<div className="flex gap-2">
					<Link href="/about" className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors">
						<span className="text-xl">ℹ️</span>
					</Link>
					<Link href="/profile" className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors">
						<span className="text-xl">👤</span>
					</Link>
				</div>
			</header>

			{/* 予算・支出サマリー */}
			{userProfile && (
				<section className="mb-8 p-6 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl shadow-xl text-white overflow-hidden relative">
					<div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
					<div className="relative z-10">
						<div className="flex justify-between items-end mb-4">
							<div>
								<p className="text-indigo-100 text-xs font-bold uppercase tracking-wider mb-1">今月の支出状況</p>
								<div className="flex items-baseline gap-2">
									<span className="text-4xl font-extrabold">¥{userProfile.totalSpent?.toLocaleString() || 0}</span>
									<span className="text-indigo-200 text-sm">/ ¥{userProfile.monthlyBudget?.toLocaleString() || 0}</span>
								</div>
							</div>
							<div className="text-right">
								<p className="text-indigo-100 text-[10px] font-bold uppercase mb-1">残り予算</p>
								<p className={`text-xl font-bold ${(userProfile.monthlyBudget - userProfile.totalSpent) < 3000 ? 'text-orange-300' : 'text-green-300'}`}>
									¥{(userProfile.monthlyBudget - userProfile.totalSpent).toLocaleString()}
								</p>
							</div>
						</div>

						{/* プログレスバー */}
						<div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
							<div
								className={`h-full rounded-full transition-all duration-1000 ${(userProfile.totalSpent / userProfile.monthlyBudget) > 0.9 ? 'bg-orange-400' : 'bg-green-400'
									}`}
								style={{ width: `${Math.min(100, (userProfile.totalSpent / (userProfile.monthlyBudget || 1)) * 100)}%` }}
							></div>
						</div>
					</div>
				</section>
			)}

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

				{/* 料理 サマリー */}
				<Link href="/recipes" className="block focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-2xl">
					<div className="bg-purple-50 border border-purple-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow h-full">
						<div className="flex items-center justify-between mb-3">
							<span className="text-2xl">🍳</span>
						</div>
						<h2 className="text-sm font-semibold text-purple-900 mb-1">登録料理</h2>
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
					<Link href="/inventory?action=register" className="flex items-center justify-center gap-2 w-full bg-gray-900 text-white font-medium py-3 rounded-xl hover:bg-gray-800 transition-colors">
						<span>＋ 新しい在庫を追加</span>
					</Link>
					<Link href="/meals?action=register" className="flex items-center justify-center gap-2 w-full bg-white border border-gray-300 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-50 transition-colors">
						<span>📝 食事を記録する</span>
					</Link>
				</div>
			</section>
		</main>
	);
}
