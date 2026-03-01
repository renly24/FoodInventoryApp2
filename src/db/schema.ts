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
    priority: text('priority'), // 例: 高, 中, 低
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
    plannedPrice: real('planned_price'),
    category: text('category'),
    memo: text('memo'),
    priority: text('priority'),
    purchased: integer('purchased', { mode: 'boolean' }).default(false).notNull(),
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
});

// 食事記録
export const meals = sqliteTable('meals', {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    mealName: text('meal_name').notNull(),
    mealDate: integer('meal_date', { mode: 'timestamp' }).notNull(), // 記録日時
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
});
