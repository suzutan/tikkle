ALTER TABLE `timers` ADD `rank` real;--> statement-breakpoint
CREATE INDEX `idx_timers_project_rank` ON `timers` (`project_id`,`rank`);