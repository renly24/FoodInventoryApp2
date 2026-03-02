import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Food Inventory PWA",
	description: "Manage your food inventory, shopping list, recipes, and meals.",
};

export const viewport: Viewport = {
	themeColor: "#ffffff",
	width: "device-width",
	initialScale: 1,
	maximumScale: 1,
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="ja">
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900 pb-16 min-h-screen flex flex-col`}>
				<div className="flex-1 overflow-y-auto w-full max-w-md mx-auto relative bg-white shadow-xl min-h-screen">
					{children}

					{/* Bottom Navigation */}
					<nav className="fixed bottom-0 w-full max-w-md bg-white border-t border-gray-200 flex justify-around items-center h-16 pb-safe z-50">
						<Link href="/" className="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-blue-600">
							<span className="text-xl mb-1">🏠</span>
							<span className="text-[10px]">ホーム</span>
						</Link>
						<Link href="/shopping" className="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-blue-600">
							<span className="text-xl mb-1">🛒</span>
							<span className="text-[10px]">買物</span>
						</Link>
						<Link href="/inventory" className="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-blue-600">
							<span className="text-xl mb-1">📦</span>
							<span className="text-[10px]">在庫</span>
						</Link>
						<Link href="/recipes" className="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-blue-600">
							<span className="text-xl mb-1">🍳</span>
							<span className="text-[10px]">レシピ</span>
						</Link>
						<Link href="/meals" className="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-blue-600">
							<span className="text-xl mb-1">🍽️</span>
							<span className="text-[10px]">食事</span>
						</Link>
					</nav>
				</div>
			</body>
		</html>
	);
}
