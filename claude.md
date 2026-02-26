# プロジェクト要件 (AI Context)

## 技術スタック

- Framework: Next.js (App Router)
- Database: Cloudflare D1
- ORM: Drizzle ORM
- Auth: Supabase Auth
- Hosting: Cloudflare Pages

## 開発ルール

- UI は Tailwind CSS を使用し、モバイルファーストで設計すること。
- DB 操作は必ず Drizzle の型安全なクエリを使用すること。
- Cloudflare の Edge Runtime で動作するコードを書くこと。
