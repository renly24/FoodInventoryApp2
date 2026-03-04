import { getShoppingItems } from '@/actions/shopping';
import Link from 'next/link';
import ShoppingRegisterModal from '@/components/shopping/ShoppingRegisterModal';
import ReceiptScannerModal from '@/components/inventory/ReceiptScannerModal';
import ShoppingListDisplay from '@/components/shopping/ShoppingListDisplay';

export const dynamic = 'force-dynamic';

export default async function ShoppingPage() {
    const items = await getShoppingItems();

    return (
        <main className="p-6">
            <div className="flex justify-between items-center mb-6 mt-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-orange-900 tracking-tight">買い物リスト</h1>
                    <p className="text-orange-600 mt-1 text-sm font-medium">買う予定のアイテム</p>
                </div>
                <div className="flex gap-2">
                    <ReceiptScannerModal triggerType="icon" />
                    <ShoppingRegisterModal />
                </div>
            </div>

            {items.length === 0 ? (
                <div className="bg-orange-50 p-10 text-center rounded-2xl shadow-sm border border-orange-100 mt-8">
                    <span className="text-5xl mb-4 block">🛒</span>
                    <p className="text-orange-800 font-medium mb-4">買い物リストは空です</p>
                    <ShoppingRegisterModal emptyState={true} />
                </div>
            ) : (
                <ShoppingListDisplay items={items} />
            )}
        </main>
    );
}
