import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

// Cloudflare WorkersのEnvからD1のバインディングを受け取って初期化する
export function createDb(d1: D1Database) {
    return drizzle(d1, { schema });
}
