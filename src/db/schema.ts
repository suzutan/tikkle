import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

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
});
