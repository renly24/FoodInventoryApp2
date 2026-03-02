import { getRecipe, getRecipeIngredients } from '@/actions/recipes';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import RecipeIngredientRegisterModal from '@/components/recipes/RecipeIngredientRegisterModal';


export const dynamic = 'force-dynamic';

export default async function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const recipe = await getRecipe(resolvedParams.id);

    if (!recipe) {
        notFound();
    }

    const ingredients = await getRecipeIngredients(resolvedParams.id);

    return (
        <main className="p-6">
            <div className="mb-6 mt-4">
                <Link href="/recipes" className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center mb-4">
                    <span>← レシピ一覧へ戻る</span>
                </Link>
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-extrabold text-purple-900 tracking-tight">{recipe.name}</h1>
                        <p className="text-purple-600 mt-1 text-sm font-medium">レシピ詳細と必要な材料</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-purple-100 overflow-hidden mb-8">
                <div className="p-6 border-b border-purple-50 flex justify-between items-center bg-purple-50/50">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <span>🥕</span> 材料リスト
                    </h2>
                    <RecipeIngredientRegisterModal recipeId={recipe.id} />
                </div>

                <div className="p-6">
                    {ingredients.length === 0 ? (
                        <div className="text-center py-8 bg-purple-50 rounded-2xl border border-purple-100">
                            <span className="text-4xl mb-3 block">🥗</span>
                            <p className="text-purple-800 font-medium mb-4">まだ材料が登録されていません</p>
                            <RecipeIngredientRegisterModal recipeId={recipe.id} emptyState={true} />
                        </div>
                    ) : (
                        <ul className="divide-y divide-purple-50">
                            {ingredients.map((ingredient) => (
                                <li key={ingredient.id} className="py-4 flex justify-between items-center group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                                        <span className="font-bold text-gray-900 text-lg">{ingredient.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-2xl font-black text-purple-600 mr-1">{ingredient.quantity}</span>
                                        <span className="text-sm text-gray-400 font-medium">{ingredient.unit}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </main>
    );
}
