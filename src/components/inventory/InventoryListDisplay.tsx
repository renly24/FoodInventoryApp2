'use client';

import { useState } from 'react';
import InventoryItemRow from './InventoryItemRow';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function InventoryListDisplay({ items }: { items: any[] }) {
    const groupedItems = items.reduce((acc, item) => {
        const category = item.category || '未分類';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(item);
        return acc;
    }, {} as Record<string, any[]>);

    const predefinedCategories = ["野菜", "肉類", "魚介類", "乳製品", "調味料", "日用品", "その他", "未分類"];

    const sortedCategories = Object.keys(groupedItems).sort((a, b) => {
        const indexA = predefinedCategories.indexOf(a);
        const indexB = predefinedCategories.indexOf(b);
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return a.localeCompare(b, "ja");
    });

    return (
        <div className="flex flex-col gap-6 pb-8">
            {sortedCategories.map(category => (
                <CategoryGroup key={category} category={category} items={groupedItems[category]} />
            ))}
        </div>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CategoryGroup({ category, items }: { category: string, items: any[] }) {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-green-100 overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full px-6 py-4 flex justify-between items-center hover:bg-green-100 focus:outline-none transition-colors ${isOpen ? 'bg-green-50 border-b border-green-100' : 'bg-green-50/50'}`}
            >
                <div className="flex items-center gap-3">
                    <span
                        className={`text-green-600 text-sm transform transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
                    >
                        ▶
                    </span>
                    <h2 className="text-xl font-bold text-gray-900">
                        {category}
                    </h2>
                </div>
                <span className="bg-white px-3 py-1 rounded-full text-sm font-bold text-green-700 shadow-sm border border-green-100">
                    {items.length}
                </span>
            </button>

            {isOpen && (
                <div className="p-4 flex flex-col gap-3 bg-gray-50/50 transition-all">
                    {items.map(item => (
                        <div key={item.id}>
                            <InventoryItemRow item={item} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
