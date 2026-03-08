CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `timers` ADD `project_id` text;--> statement-breakpoint
CREATE INDEX `idx_timers_project_id` ON `timers` (`project_id`);