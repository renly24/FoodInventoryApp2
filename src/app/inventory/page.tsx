import { getInventoryItems } from '@/actions/inventory';
import Link from 'next/link';
import InventoryRegisterModal from '@/components/inventory/InventoryRegisterModal';
import ReceiptScannerModal from '@/components/inventory/ReceiptScannerModal';
import InventoryListDisplay from '@/components/inventory/InventoryListDisplay';

export const dynamic = 'force-dynamic'; // キャッシュを無効化して常に最新を取得

export default async function InventoryPage() {
    // サーバーアクションから在庫情報を取得
    const items = await getInventoryItems();

    return (
        <main className="p-6">
            <div className="flex justify-between items-center mb-6 mt-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">在庫一覧</h1>
                    <p className="text-gray-500 mt-1 text-sm">現在のシステム上の在庫</p>
                </div>
                <div className="flex gap-2">
                    <ReceiptScannerModal triggerType="icon" />
                    <InventoryRegisterModal />
                </div>
            </div>

            {items.length === 0 ? (
                <div className="bg-white p-10 text-center rounded-2xl shadow-sm border border-gray-100 mt-8">
                    <span className="text-5xl mb-4 block">📦</span>
                    <p className="text-gray-600 font-medium mb-4">在庫アイテムがありません</p>
                    <InventoryRegisterModal emptyState={true} />
                </div>
            ) : (
                <InventoryListDisplay items={items} />
            )}
        </main>
    );
}
