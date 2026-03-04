'use client';

import { useState } from 'react';
import { updateSpent, resetSpent } from '@/actions/users';

export default function ProfileForm({
    initialSpent
}: {
    initialSpent: number;
}) {
    const [spent, setSpent] = useState(initialSpent);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);


    async function handleUpdateSpent(e: React.FormEvent) {
        e.preventDefault();
        setIsSaving(true);
        setMessage(null);
        try {
            const result = await updateSpent(spent);
            if ('error' in result) {
                setMessage({ type: 'error', text: result.error || 'エラーが発生しました' });
            } else {
                setMessage({ type: 'success', text: '支出を更新しました' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'エラーが発生しました' });
        } finally {
            setIsSaving(false);
        }
    }

    async function handleResetSpent() {
        if (!confirm('今月の支出を0にリセットしますか？')) return;
        setIsSaving(true);
        setMessage(null);
        try {
            const result = await resetSpent();
            if ('error' in result) {
                setMessage({ type: 'error', text: result.error || 'エラーが発生しました' });
            } else {
                setSpent(0);
                setMessage({ type: 'success', text: '支出をリセットしました' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'エラーが発生しました' });
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="flex flex-col gap-8">
            {message && (
                <div className={`p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                    }`}>
                    {message.text}
                </div>
            )}


            <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <span className="text-xl">📊</span> 支出管理
                </h3>
                <form onSubmit={handleUpdateSpent} className="flex flex-col gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">現在の支出合計 (円)</label>
                        <input
                            type="number"
                            value={spent}
                            onChange={(e) => setSpent(Number(e.target.value))}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-lg font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="w-full bg-white border border-blue-600 text-blue-600 font-bold py-3 rounded-xl hover:bg-blue-50 transition disabled:gray-300"
                    >
                        支出額を修正
                    </button>
                </form>

                <div className="pt-6 border-t border-gray-100">
                    <button
                        onClick={handleResetSpent}
                        disabled={isSaving}
                        className="w-full bg-red-50 text-red-600 font-bold py-3 rounded-xl hover:bg-red-100 transition disabled:bg-gray-100"
                    >
                        今月の支出をリセット (0円にする)
                    </button>
                    <p className="mt-2 text-center text-xs text-gray-400">新しい月が始まった際に行ってください。</p>
                </div>
            </section>
        </div>
    );
}
