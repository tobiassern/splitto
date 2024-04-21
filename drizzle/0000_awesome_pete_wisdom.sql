CREATE TABLE `email_verification_tokens` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`email` text NOT NULL,
	`user_id` integer NOT NULL,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`expires_at` integer NOT NULL,
	`user_agent` text,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`avatar_url` text,
	`super_admin` integer,
	`email_verified` integer DEFAULT false
);
--> statement-breakpoint
CREATE TABLE `group_members` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP),
	`group_id` integer NOT NULL,
	`user_id` integer,
	`name` text NOT NULL,
	`email` text,
	FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `groups` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP),
	`name` text NOT NULL,
	`user_id` integer,
	`currency` text DEFAULT 'USD' NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `transaction_splits` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text NOT NULL,
	`transaction_id` integer NOT NULL,
	`amount` real NOT NULL,
	`group_member_id` integer NOT NULL,
	FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`group_member_id`) REFERENCES `group_members`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` integer DEFAULT (CURRENT_TIMESTAMP),
	`type` text NOT NULL,
	`when` integer DEFAULT (CURRENT_TIMESTAMP),
	`label` text NOT NULL,
	`group_id` integer NOT NULL,
	`group_member_id` integer NOT NULL,
	FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`group_member_id`) REFERENCES `group_members`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `group_members_group_id_email_unique` ON `group_members` (`group_id`,`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `group_members_group_id_user_id_unique` ON `group_members` (`group_id`,`user_id`);