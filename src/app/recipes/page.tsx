import { getRecipes } from '@/actions/recipes';
import Link from 'next/link';
import RecipeRegisterModal from '@/components/recipes/RecipeRegisterModal';

export const dynamic = 'force-dynamic';

export default async function RecipesPage() {
    const recipesList = await getRecipes();

    return (
        <main className="p-6">
            <div className="flex justify-between items-center mb-6 mt-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-purple-900 tracking-tight">レシピ</h1>
                    <p className="text-purple-600 mt-1 text-sm font-medium">お気に入りの料理</p>
                </div>
                <RecipeRegisterModal />
            </div>

            {recipesList.length === 0 ? (
                <div className="bg-purple-50 p-10 text-center rounded-2xl shadow-sm border border-purple-100 mt-8">
                    <span className="text-5xl mb-4 block">🍳</span>
                    <p className="text-purple-800 font-medium mb-4">レシピが登録されていません</p>
                    <RecipeRegisterModal emptyState={true} />
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 pb-8">
                    {recipesList.map((recipe) => (
                        <Link href={`/recipes/${recipe.id}`} key={recipe.id} className="block group focus:outline-none">
                            <div className="p-5 border border-purple-100 rounded-2xl shadow-sm group-hover:shadow-md group-hover:border-purple-300 transition-all bg-white w-full">
                                <h2 className="font-bold text-lg text-gray-900">{recipe.name}</h2>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </main>
    );
}
