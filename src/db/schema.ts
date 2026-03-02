import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core';

// ユーザー情報
export const users = sqliteTable('users', {
    id: text('id').primaryKey(), // Firebase Authentication UID
    email: text('email').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
});

// 在庫アイテム
export const inventoryItems = sqliteTable('inventory_items', {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    quantity: real('quantity').notNull(),
    unit: text('unit').notNull(), // 例: 個, g, L など
    price: real('price'),
    category: text('category'), // 例: 食品, 日用品 など
    memo: text('memo'),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
});

// 買い物リスト
export const shoppingListItems = sqliteTable('shopping_list_items', {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    quantity: real('quantity').notNull(),
    unit: text('unit').notNull(),
    expectedPrice: real('expected_price'), // plannedPriceから変更
    category: text('category'),
    memo: text('memo'),
    priority: integer('priority'), // 文字列から数値に変更
    isPurchased: integer('is_purchased', { mode: 'boolean' }).default(false).notNull(), // purchasedから変更
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
});

// レシピ
export const recipes = sqliteTable('recipes', {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
});

// レシピの材料
export const recipeIngredients = sqliteTable('recipe_ingredients', {
    id: text('id').primaryKey(),
    recipeId: text('recipe_id').notNull().references(() => recipes.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    quantity: real('quantity').notNull(),
    unit: text('unit').notNull(), // 例: 個, g, L など
    inventoryItemId: text('inventory_item_id'), // 任意連携のためのIDを追加
});

// 食事記録
export const meals = sqliteTable('meals', {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    recipeId: text('recipe_id'), // レシピ由来の場合の連携IDを追加
    name: text('name').notNull(), // mealNameから変更
    date: integer('date', { mode: 'timestamp' }).notNull(), // mealDateから変更
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(), // 欠落していたので追加
});

// 食事で消費した食材・在庫 (自動更新のため追加)
export const mealIngredientsUsed = sqliteTable('meal_ingredients_used', {
    id: text('id').primaryKey(),
    mealId: text('meal_id').notNull().references(() => meals.id, { onDelete: 'cascade' }),
    inventoryItemId: text('inventory_item_id').notNull(), // 消費した在庫
    quantityUsed: real('quantity_used').notNull(), // 消費した量
});
