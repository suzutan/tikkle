import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';

export const timers = sqliteTable('timers', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type', {
    enum: ['countdown', 'elapsed', 'countdown-elapsed', 'stamina', 'periodic-increment'],
  }).notNull(),
  tags: text('tags'), // JSON array of tag strings
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  // countdown, countdown-elapsed
  targetDate: text('target_date'),
  // elapsed
  startDate: text('start_date'),
  // stamina, periodic-increment
  currentValue: integer('current_value'),
  maxValue: integer('max_value'),
  lastUpdatedAt: text('last_updated_at'),
  // stamina
  recoveryIntervalMinutes: real('recovery_interval_minutes'),
  recoveryIntervalSeconds: real('recovery_interval_seconds'), // Preferred over minutes
  // periodic-increment
  incrementAmount: integer('increment_amount'),
  scheduleTimes: text('schedule_times'), // JSON array
  // archive
  archivedAt: text('archived_at'),
  // priority: 1=緊急, 2=高, 3=中, 4=なし
  priority: integer('priority').notNull().default(4),
  // project
  projectId: text('project_id'),
  // manual sort order (fractional indexing)
  rank: real('rank'),
}, (table) => [
  index('idx_timers_project_id').on(table.projectId),
  index('idx_timers_project_rank').on(table.projectId, table.rank),
]);

export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});
