'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { analyzeReceiptAction, saveReceiptItemsAction, saveMealReceiptAction, saveRecipeReceiptAction, ReceiptItem } from '@/actions/receipt';

export default function ReceiptScannerModal({ triggerType = 'icon', mode = 'inventory', recipeId }: { triggerType?: 'icon' | 'full', mode?: 'inventory' | 'meal' | 'recipe', recipeId?: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [results, setResults] = useState<ReceiptItem[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [title, setTitle] = useState('');
    const router = useRouter();

    const handleItemChange = (index: number, field: keyof ReceiptItem, value: any) => {
        if (!results) return;
        const newResults = [...results];
        newResults[index] = { ...newResults[index], [field]: value };
        setResults(newResults);
    };

    const handleRemoveItem = (index: number) => {
        if (!results) return;
        setResults(results.filter((_, i) => i !== index));
    };

    const resetState = () => {
        setFile(null);
        setPreviewUrl(null);
        setIsAnalyzing(false);
        setResults(null);
        setError(null);
        setIsSaving(false);
        setTitle('');
    };

    const handleClose = () => {
        setIsOpen(false);
        resetState();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
            setResults(null);
            setError(null);
        }
    };

    const handleAnalyze = async () => {
        if (!file) return;

        setIsAnalyzing(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('receipt', file);

            const response = await analyzeReceiptAction(formData, mode);

            if (response.success && response.data) {
                setResults(response.data);
            } else {
                setError(response.error || '不明なエラーが発生しました');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'サーバーエラーが発生しました');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSave = async () => {
        if (!results || results.length === 0) return;

        setIsSaving(true);
        setError(null);

        try {
            const response = mode === 'meal'
                ? await saveMealReceiptAction(results, title)
                : mode === 'recipe' && recipeId
                    ? await saveRecipeReceiptAction(results, recipeId, title)
                    : await saveReceiptItemsAction(results);
            if (response.success) {
                handleClose();
                router.refresh(); // 更新されたリストを反映
            } else {
                setError(response.error || 'データ保存時にエラーが発生しました。');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'サーバーエラーが発生しました');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            {triggerType === 'icon' ? (
                <button
                    onClick={() => setIsOpen(true)}
                    className={`flex items-center justify-center gap-1.5 font-bold py-2 px-3 lg:px-4 rounded-xl transition-colors shadow-sm text-sm ${mode === 'recipe' ? 'bg-purple-50 text-purple-600 hover:bg-purple-100' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                >
                    <span className="text-lg">{mode === 'recipe' ? '📷' : '🧾'}</span>
                    <span className="hidden lg:inline">{mode === 'recipe' ? '画像から読取' : 'レシート入力'}</span>
                </button>
            ) : (
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center justify-center gap-2 w-full bg-gray-900 text-white font-medium py-3 rounded-xl hover:bg-gray-800 transition-colors"
                >
                    <span>{mode === 'recipe' ? '📷 画像から材料を読み取る' : `🧾 レシートから${mode === 'meal' ? '外食記録' : '在庫記録'}`}</span>
                </button>
            )}

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                    <div className="bg-white rounded-3xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[95vh]">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <span className="bg-gradient-to-br from-blue-100 to-indigo-100 p-2 rounded-xl text-2xl shadow-inner border border-white">🧾</span>
                                AIレシート読取
                            </h2>
                            <button
                                type="button"
                                onClick={handleClose}
                                className="text-gray-400 hover:text-gray-600 p-2 -mr-2 rounded-full hover:bg-gray-100 transition"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-6">
                            {/* 1. 画像アップロード */}
                            <section className="bg-gray-50/50 p-6 rounded-3xl border border-gray-200 border-dashed hover:bg-gray-50 transition-colors group relative overflow-hidden">
                                <div className="absolute inset-0 bg-blue-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                                <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                                    <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-blue-500 mb-2">
                                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <label className="cursor-pointer group-hover:text-blue-600 transition-colors">
                                        <span className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold shadow-md hover:bg-blue-700 hover:shadow-lg active:scale-95 transition-all inline-block">
                                            画像を選択 / カメラを起動
                                        </span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />
                                    </label>
                                    <p className="text-xs text-gray-400 font-medium">JPG, PNG等のフォーマットに対応</p>
                                </div>
                            </section>

                            {/* エラー表示 */}
                            {error && (
                                <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 font-bold text-sm animate-pulse flex items-center gap-2">
                                    <span>⚠️</span>
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="grid md:grid-cols-2 gap-8">
                                {/* 2. プレビュー領域 */}
                                <section className={`flex flex-col ${!previewUrl && 'opacity-30 grayscale'}`}>
                                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-xs">1</span>
                                        対象レシート
                                    </h2>
                                    <div className="bg-gray-100 rounded-3xl overflow-hidden aspect-[3/4] border border-gray-200 relative shadow-inner flex flex-col items-center justify-center">
                                        {previewUrl ? (
                                            <img src={previewUrl} alt="Receipt preview" className="object-cover w-full h-full" />
                                        ) : (
                                            <span className="text-gray-400 font-bold flex flex-col items-center gap-2">
                                                <span className="text-3xl opacity-50">📷</span>
                                                未選択
                                            </span>
                                        )}

                                        {/* 解析中のオーバーレイ */}
                                        {isAnalyzing && (
                                            <div className="absolute inset-0 bg-blue-900/80 backdrop-blur-sm flex flex-col items-center justify-center text-white z-10 animate-in fade-in">
                                                <div className="w-12 h-12 border-4 border-blue-400 border-t-white rounded-full animate-spin mb-4 shadow-lg"></div>
                                                <p className="font-bold tracking-widest animate-pulse drop-shadow-md">AIが解析中...</p>
                                                <p className="text-xs text-blue-200 mt-2 font-medium">これには数秒かかります</p>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={handleAnalyze}
                                        disabled={!file || isAnalyzing}
                                        className={`mt-4 w-full py-4 rounded-2xl font-black text-lg shadow-lg hover:shadow-xl transition-all active:scale-95 ${!file
                                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                                            : 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white hover:from-indigo-600 hover:to-blue-700'
                                            }`}
                                    >
                                        AIで読み取る ✨
                                    </button>
                                </section>

                                {/* 3. 結果領域 */}
                                <section className={`flex flex-col h-full ${!results && 'opacity-30 grayscale'}`}>
                                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-xs">2</span>
                                        抽出結果
                                    </h2>

                                    {(mode === 'meal' || mode === 'recipe') && results && (
                                        <div className="mb-4 bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex-shrink-0">
                                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                                {mode === 'recipe' ? '料理名' : 'タイトル'}
                                            </label>
                                            <input
                                                type="text"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                placeholder={mode === 'recipe' ? '料理名を入力 (省略可)' : '外食 (レシート読取)'}
                                                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition font-bold bg-gray-50 hover:bg-white text-gray-900"
                                            />
                                        </div>
                                    )}

                                    <div className="bg-gray-50 rounded-3xl p-4 border border-gray-200 shadow-inner flex-grow overflow-hidden flex flex-col">
                                        {results ? (
                                            <ul className="overflow-y-auto space-y-3 h-full pr-2 scrollbar-thin scrollbar-thumb-gray-300 min-h-[200px] max-h-[300px] md:max-h-none">
                                                {results.map((item, index) => (
                                                    <li key={index} className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-2 hover:border-blue-200 transition-colors group relative">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveItem(index)}
                                                            className="absolute -top-2 -right-2 bg-red-100 text-red-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold hover:bg-red-500 hover:text-white transition opacity-0 group-hover:opacity-100 shadow-sm z-10"
                                                            title="この項目を削除"
                                                        >✕</button>

                                                        <input
                                                            value={item.name}
                                                            onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                                                            className="font-bold text-gray-900 text-base md:text-lg border-b border-transparent hover:border-gray-200 focus:border-blue-500 focus:outline-none w-full pb-1 transition-colors bg-transparent"
                                                            placeholder="商品名・品目"
                                                        />

                                                        <div className="flex items-center justify-between mt-1">
                                                            <div className="flex items-center bg-blue-50 rounded-xl overflow-hidden border border-blue-100">
                                                                <button type="button" onClick={() => handleItemChange(index, 'quantity', Math.max(1, (item.quantity || 1) - 1))} className="px-3 py-1 font-bold text-blue-600 hover:bg-blue-100 active:bg-blue-200 transition-colors">-</button>
                                                                <span className="font-black text-blue-800 w-8 text-center text-sm">{item.quantity}</span>
                                                                <button type="button" onClick={() => handleItemChange(index, 'quantity', (item.quantity || 1) + 1)} className="px-3 py-1 font-bold text-blue-600 hover:bg-blue-100 active:bg-blue-200 transition-colors">+</button>
                                                            </div>

                                                            {mode === 'recipe' ? (
                                                                <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100 hover:border-gray-200 transition hover:bg-white focus-within:border-blue-300 focus-within:bg-white flex-grow ml-2">
                                                                    <input
                                                                        type="text"
                                                                        value={item.unit || ''}
                                                                        onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                                                                        className="w-full text-right text-gray-700 font-bold focus:outline-none bg-transparent"
                                                                        placeholder="単位"
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100 hover:border-gray-200 transition hover:bg-white focus-within:border-blue-300 focus-within:bg-white">
                                                                    <span className="text-gray-400 font-bold text-sm">¥</span>
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        value={item.price || 0}
                                                                        onChange={(e) => handleItemChange(index, 'price', parseInt(e.target.value) || 0)}
                                                                        className="w-16 text-right text-gray-700 font-bold focus:outline-none bg-transparent"
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-gray-400 font-bold gap-3 py-10">
                                                <span className="text-5xl opacity-30 mb-2">📋</span>
                                                <p>読み取るとリストが表示されます</p>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        disabled={!results || isSaving}
                                        onClick={handleSave}
                                        className={`mt-4 w-full py-4 rounded-2xl font-bold text-lg shadow-md transition-all ${!results || isSaving
                                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                                            : 'bg-green-500 text-white hover:bg-green-600 hover:shadow-lg active:scale-95'
                                            }`}
                                    >
                                        {isSaving ? '保存中...' : '内容を保存'}
                                    </button>
                                </section>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
