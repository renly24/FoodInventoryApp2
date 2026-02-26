import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.dev.vars' });

export default defineConfig({
    schema: './src/db/schema.ts',
    out: './drizzle',
    dialect: 'sqlite',
    driver: 'd1-http',
    dbCredentials: {
        accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
        databaseId: 'a6ce78e6-5029-43a8-aabe-6f1b64760cfd',
        token: process.env.CLOUDFLARE_D1_TOKEN!,
    },
});
