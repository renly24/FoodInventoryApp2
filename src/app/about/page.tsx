import Link from 'next/link';

export default function AboutPage() {
    const features = [
        {
            title: 'スマートな在庫管理',
            emoji: '📦',
            description: '冷蔵庫やパントリーの在庫をリアルタイムで管理。賞味期限切れを防ぎ、フードロスを削減します。',
            color: 'bg-green-50',
            borderColor: 'border-green-100',
            iconColor: 'bg-green-100'
        },
        {
            title: '効率的なお買い物',
            emoji: '🛒',
            description: '足りないものを買い物リストに。優先度設定やカテゴリー分けで、お店での買い物をスムーズにします。',
            color: 'bg-orange-50',
            borderColor: 'border-orange-100',
            iconColor: 'bg-orange-100'
        },
        {
            title: 'お気に入りレシピ',
            emoji: '🍳',
            description: '自慢のレシピを材料と一緒に保存。在庫と連携して、今あるもので何が作れるかを確認できます。',
            color: 'bg-purple-50',
            borderColor: 'border-purple-100',
            iconColor: 'bg-purple-100'
        },
        {
            title: '毎日の食事記録',
            emoji: '🍽️',
            description: '「今日何食べた？」を記録。使った食材は在庫から自動で差し引かれ、正確な残量をキープします。',
            color: 'bg-blue-50',
            borderColor: 'border-blue-100',
            iconColor: 'bg-blue-100'
        }
    ];

    return (
        <main className="min-h-screen bg-white relative">
            {/* Back Button */}
            <Link href="/" className="fixed top-6 right-6 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 transition-colors shadow-lg">
                <span className="text-xl">✕</span>
            </Link>

            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 pt-16 pb-24 px-6 text-white text-center">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-blue-400 opacity-20 rounded-full blur-3xl"></div>

                <div className="relative">
                    <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest uppercase bg-blue-500/30 backdrop-blur-md border border-white/20 rounded-full">
                        Smart Food Management App
                    </span>
                    <h1 className="text-4xl font-extrabold mb-4 leading-tight tracking-tight">
                        毎日の食生活を、<br /><span className="text-yellow-300">もっと賢く、もっと楽しく。</span>
                    </h1>
                    <p className="max-w-xs mx-auto text-blue-100 text-lg mb-10 leading-relaxed font-light">
                        Food Inventory Trackerは、食材管理から献立作成までをシンプルにするモバイルPWAです。
                    </p>
                    <div className="flex flex-col gap-3 max-w-xs mx-auto">
                        <Link href="/" className="px-8 py-4 bg-white text-blue-600 font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5">
                            今すぐはじめる
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="px-6 py-16 -mt-12 relative z-10 bg-white rounded-t-[40px] shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between mb-10">
                    <h2 className="text-2xl font-bold text-gray-900">主な機能</h2>
                    <div className="h-1 w-12 bg-blue-600 rounded-full"></div>
                </div>

                <div className="space-y-6">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className={`flex flex-col p-6 rounded-3xl border ${feature.borderColor} ${feature.color} transition-all hover:shadow-md`}
                        >
                            <div className={`w-12 h-12 flex items-center justify-center rounded-2xl ${feature.iconColor} text-2xl mb-4 shadow-inner`}>
                                {feature.emoji}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                            <p className="text-gray-600 leading-relaxed text-sm">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Why US? Section */}
            <section className="px-6 py-16 bg-gray-50">
                <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">なぜこのアプリ？</h2>

                <div className="space-y-8">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold">1</div>
                        <div>
                            <h4 className="font-bold text-gray-800">モバイルファースト</h4>
                            <p className="text-sm text-gray-600 mt-1">キッチンやお買い物中に片手でサッと操作できるよう設計されています。</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold">2</div>
                        <div>
                            <h4 className="font-bold text-gray-800">在庫の自動連携</h4>
                            <p className="text-sm text-gray-600 mt-1">食事を記録するだけで在庫が更新。面倒な手入力を最小限に抑えます。</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold">3</div>
                        <div>
                            <h4 className="font-bold text-gray-800">PWA対応</h4>
                            <p className="text-sm text-gray-600 mt-1">スマホのホーム画面に追加して、アプリのようにサクサク使えます。</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="px-6 py-20 text-center">
                <h2 className="text-2xl font-extrabold text-gray-900 mb-4">さあ、一歩進んだ<br />食材管理を。</h2>
                <p className="text-gray-500 mb-8 max-w-xs mx-auto">
                    無駄をなくして、もっと美味しい毎日を過ごしませんか？
                </p>
                <Link href="/" className="inline-block px-10 py-5 bg-gray-900 text-white font-bold rounded-2xl shadow-xl hover:bg-gray-800 transition-all">
                    無料で利用する
                </Link>
                <p className="mt-6 text-xs text-gray-400">
                    © 2026 Food Inventory Tracker
                </p>
            </section>
        </main>
    );
}
