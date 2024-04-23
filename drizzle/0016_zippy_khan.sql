ALTER TABLE `user` RENAME COLUMN `budget` TO `budget_weekly`;--> statement-breakpoint
ALTER TABLE user ADD `budget_monthly` real;--> statement-breakpoint
ALTER TABLE `user` DROP COLUMN `budget_per`;