'use client';

import { useState, useRef, useEffect, useTransition } from 'react';

interface EditableTitleProps {
    id: string;
    initialTitle: string;
    action: (id: string, newName: string) => Promise<{ error?: string; success?: boolean }>;
    placeholder?: string;
}

export default function EditableTitle({ id, initialTitle, action, placeholder = "タイトルを入力" }: EditableTitleProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(initialTitle);
    const [isPending, startTransition] = useTransition();
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleSubmit = () => {
        if (title.trim() === '') {
            setTitle(initialTitle);
            setIsEditing(false);
            return;
        }

        if (title === initialTitle) {
            setIsEditing(false);
            return;
        }

        startTransition(async () => {
            const res = await action(id, title);
            if (res?.error) {
                alert(res.error);
                setTitle(initialTitle);
            }
            setIsEditing(false);
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSubmit();
        } else if (e.key === 'Escape') {
            setTitle(initialTitle);
            setIsEditing(false);
        }
    };

    return (
        <>
            <h1
                className="text-3xl font-extrabold text-purple-900 tracking-tight cursor-pointer hover:bg-purple-50 rounded-lg px-2 -ml-2 py-1 transition group flex items-center gap-2"
                onClick={() => setIsEditing(true)}
                title="クリックして編集"
            >
                {title}
                <span className="opacity-0 group-hover:opacity-100 text-purple-400 text-lg transition-opacity">✏️</span>
            </h1>

            {isEditing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                    <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h2 className="text-xl font-bold text-gray-900">タイトルの編集</h2>
                            <button
                                type="button"
                                onClick={() => {
                                    setTitle(initialTitle);
                                    setIsEditing(false);
                                }}
                                className="text-gray-400 hover:text-gray-600 p-2 -mr-2 rounded-full hover:bg-gray-100 transition"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            <div className="flex flex-col gap-4">
                                <div>
                                    <label htmlFor="title" className="block text-sm font-bold text-gray-700 mb-1">
                                        タイトル <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        id="title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        disabled={isPending}
                                        placeholder={placeholder}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-gray-900 font-bold"
                                    />
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    disabled={isPending || title.trim() === ''}
                                    className={`mt-6 text-white font-bold text-lg px-6 py-4 rounded-xl transition shadow-sm w-full ${isPending || title.trim() === ''
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-purple-600 hover:bg-purple-700'
                                        }`}
                                >
                                    {isPending ? '保存中...' : '保存する'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
