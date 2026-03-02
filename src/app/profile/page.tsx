import { getProfile } from '@/actions/users';
import ProfileForm from '@/components/profile/ProfileForm';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
    const profile = await getProfile();

    if (!profile) {
        return (
            <main className="p-6 text-center">
                <p>プロフィールが見つかりません</p>
            </main>
        );
    }

    return (
        <main className="p-6 mb-20 bg-gray-50/50 min-h-screen">
            <header className="mb-10 text-center relative pt-8">
                <div className="absolute top-0 right-0">
                    <Link href="/" className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-gray-400 hover:text-gray-600 shadow-sm border border-gray-100 transition">
                        ✕
                    </Link>
                </div>
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white mx-auto shadow-xl ring-4 ring-white mb-4">
                    <span className="text-4xl">🥘</span>
                </div>
                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">マイページ</h1>
                <p className="text-gray-500 text-sm mt-1">{profile.email}</p>
            </header>

            <ProfileForm
                initialBudget={profile.monthlyBudget}
                initialSpent={profile.totalSpent}
            />

            <div className="mt-12 text-center text-gray-400 text-xs">
                <p>Food Inventory App v1.0.0</p>
            </div>
        </main>
    );
}
