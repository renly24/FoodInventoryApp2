import RegisterForm from '@/components/auth/RegisterForm';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function RegisterPage() {
    const session = await auth();

    if (session?.user) {
        redirect('/');
    }

    return (
        <main className="min-h-[80vh] p-6 flex flex-col justify-center">
            <header className="mb-12 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center text-white mx-auto shadow-xl ring-4 ring-white mb-6">
                    <span className="text-4xl font-bold">🥗</span>
                </div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">アカウント登録</h1>
                <p className="text-gray-500 mt-2 font-medium">冷蔵庫の中身をスマートに管理</p>
            </header>

            <RegisterForm />
        </main>
    );
}
