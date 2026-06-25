CREATE TABLE `titles` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`status` text DEFAULT 'WATCHLIST' NOT NULL,
	`name` text NOT NULL,
	`year` integer,
	`tmdb_id` integer,
	`poster_url` text,
	`image_source` text DEFAULT 'NONE' NOT NULL,
	`overview` text,
	`runtime` integer,
	`total_seasons` integer,
	`genres` text DEFAULT '[]' NOT NULL,
	`rating` integer,
	`current_season` integer,
	`current_episode` integer,
	`favorite` integer DEFAULT false NOT NULL,
	`notes` text,
	`tags` text DEFAULT '[]' NOT NULL,
	`watched_at` integer,
	`added_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `titles_user_status_idx` ON `titles` (`user_id`,`status`);--> statement-breakpoint
CREATE INDEX `titles_user_type_idx` ON `titles` (`user_id`,`type`);--> statement-breakpoint
CREATE INDEX `titles_user_updated_idx` ON `titles` (`user_id`,`updated_at`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);