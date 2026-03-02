CREATE TABLE `meal_ingredients_used` (
	`id` text PRIMARY KEY NOT NULL,
	`meal_id` text NOT NULL,
	`inventory_item_id` text NOT NULL,
	`quantity_used` real NOT NULL,
	FOREIGN KEY (`meal_id`) REFERENCES `meals`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_inventory_items` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`quantity` real NOT NULL,
	`unit` text NOT NULL,
	`price` real,
	`category` text,
	`memo` text,
	`priority` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_inventory_items`("id", "user_id", "name", "quantity", "unit", "price", "category", "memo", "priority", "created_at", "updated_at") SELECT "id", "user_id", "name", "quantity", "unit", "price", "category", "memo", "priority", "created_at", "updated_at" FROM `inventory_items`;--> statement-breakpoint
DROP TABLE `inventory_items`;--> statement-breakpoint
ALTER TABLE `__new_inventory_items` RENAME TO `inventory_items`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_shopping_list_items` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`quantity` real NOT NULL,
	`unit` text NOT NULL,
	`expected_price` real,
	`category` text,
	`memo` text,
	`priority` integer,
	`is_purchased` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_shopping_list_items`("id", "user_id", "name", "quantity", "unit", "expected_price", "category", "memo", "priority", "is_purchased", "created_at", "updated_at") SELECT "id", "user_id", "name", "quantity", "unit", "expected_price", "category", "memo", "priority", "is_purchased", "created_at", "updated_at" FROM `shopping_list_items`;--> statement-breakpoint
DROP TABLE `shopping_list_items`;--> statement-breakpoint
ALTER TABLE `__new_shopping_list_items` RENAME TO `shopping_list_items`;--> statement-breakpoint
ALTER TABLE `meals` ADD `recipe_id` text;--> statement-breakpoint
ALTER TABLE `meals` ADD `name` text NOT NULL;--> statement-breakpoint
ALTER TABLE `meals` ADD `date` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `meals` ADD `updated_at` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `meals` DROP COLUMN `meal_name`;--> statement-breakpoint
ALTER TABLE `meals` DROP COLUMN `meal_date`;--> statement-breakpoint
ALTER TABLE `recipe_ingredients` ADD `inventory_item_id` text;--> statement-breakpoint
ALTER TABLE `recipes` ADD `description` text;--> statement-breakpoint
ALTER TABLE `recipes` ADD `prep_time` integer;--> statement-breakpoint
ALTER TABLE `recipes` ADD `cook_time` integer;--> statement-breakpoint
ALTER TABLE `recipes` ADD `servings` integer;