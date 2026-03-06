'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';

interface DeleteButtonProps {
    id: string;
    action: (id: string) => Promise<{ error?: string; success?: boolean }>;
    redirectUrl: string;
    confirmMessage?: string;
    label?: string;
}

export default function DeleteButton({
    id,
    action,
    redirectUrl,
    confirmMessage = "本当に削除しますか？\nこの操作は取り消せません。",
    label = "削除する"
}: DeleteButtonProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleDelete = () => {
        if (!window.confirm(confirmMessage)) return;

        startTransition(async () => {
            const res = await action(id);
            if (res?.error) {
                alert(res.error);
            } else {
                router.push(redirectUrl);
            }
        });
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isPending}
            className={`text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl transition font-bold text-sm flex items-center gap-1 shadow-sm ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            <span className="text-lg">🗑️</span>
            {isPending ? '削除中...' : label}
        </button>
    );
}
