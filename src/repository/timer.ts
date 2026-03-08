import { eq, desc, isNull, isNotNull, and } from 'drizzle-orm';
import { drizzle, DrizzleD1Database } from 'drizzle-orm/d1';
import { timers } from '../db/schema';
import type { Timer, CreateTimerInput, UpdateTimerInput } from '../domain/timer/types';

type TimerRow = typeof timers.$inferSelect;
type TimerInsert = typeof timers.$inferInsert;

export function toTimer(row: TimerRow): Timer {
  const base = {
    id: row.id,
    name: row.name,
    tags: row.tags ? JSON.parse(row.tags) : undefined,
    priority: row.priority ?? 4,
    projectId: row.projectId ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    archivedAt: row.archivedAt ?? undefined,
  };

  switch (row.type) {
    case 'countdown':
      return { ...base, type: 'countdown', targetDate: row.targetDate! };
    case 'elapsed':
      return { ...base, type: 'elapsed', startDate: row.startDate! };
    case 'countdown-elapsed':
      return { ...base, type: 'countdown-elapsed', targetDate: row.targetDate! };
    case 'stamina':
      return {
        ...base,
        type: 'stamina',
        currentValue: row.currentValue!,
        maxValue: row.maxValue!,
        recoveryIntervalMinutes: row.recoveryIntervalMinutes!,
        recoveryIntervalSeconds: row.recoveryIntervalSeconds ?? undefined,
        lastUpdatedAt: row.lastUpdatedAt!,
      };
    case 'periodic-increment':
      return {
        ...base,
        type: 'periodic-increment',
        currentValue: row.currentValue!,
        maxValue: row.maxValue!,
        incrementAmount: row.incrementAmount!,
        scheduleTimes: JSON.parse(row.scheduleTimes!),
        lastUpdatedAt: row.lastUpdatedAt!,
      };
    default:
      throw new Error(`Unknown timer type: ${row.type}`);
  }
}

export function toInsertValues(input: CreateTimerInput, id: string, now: string): TimerInsert {
  const base = {
    id,
    name: input.name,
    type: input.type,
    tags: input.tags && input.tags.length > 0 ? JSON.stringify(input.tags) : null,
    priority: input.priority ?? 4,
    projectId: input.projectId ?? null,
    createdAt: now,
    updatedAt: now
  };

  switch (input.type) {
    case 'countdown':
      return { ...base, targetDate: input.targetDate };
    case 'elapsed':
      return { ...base, startDate: input.startDate };
    case 'countdown-elapsed':
      return { ...base, targetDate: input.targetDate };
    case 'stamina':
      return {
        ...base,
        currentValue: input.currentValue,
        maxValue: input.maxValue,
        recoveryIntervalMinutes: input.recoveryIntervalMinutes,
        recoveryIntervalSeconds: input.recoveryIntervalSeconds ?? null,
        lastUpdatedAt: input.lastUpdatedAt,
      };
    case 'periodic-increment':
      return {
        ...base,
        currentValue: input.currentValue,
        maxValue: input.maxValue,
        incrementAmount: input.incrementAmount,
        scheduleTimes: JSON.stringify(input.scheduleTimes),
        lastUpdatedAt: input.lastUpdatedAt,
      };
  }
}

export class D1TimerRepository {
  private db: DrizzleD1Database;

  constructor(d1: D1Database) {
    this.db = drizzle(d1);
  }

  async getAll(opts?: { includeArchived?: boolean }): Promise<Timer[]> {
    const query = this.db.select().from(timers);
    if (!opts?.includeArchived) {
      const rows = await query.where(isNull(timers.archivedAt)).orderBy(desc(timers.createdAt));
      return rows.map(toTimer);
    }
    const rows = await query.orderBy(desc(timers.createdAt));
    return rows.map(toTimer);
  }

  async getArchived(): Promise<Timer[]> {
    const rows = await this.db.select().from(timers).where(isNotNull(timers.archivedAt)).orderBy(desc(timers.createdAt));
    return rows.map(toTimer);
  }

  async getById(id: string): Promise<Timer | undefined> {
    const rows = await this.db.select().from(timers).where(eq(timers.id, id)).limit(1);
    return rows.length > 0 ? toTimer(rows[0]) : undefined;
  }

  async create(input: CreateTimerInput): Promise<Timer> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const values = toInsertValues(input, id, now);
    await this.db.insert(timers).values(values);
    return (await this.getById(id))!;
  }

  async update(id: string, input: UpdateTimerInput): Promise<Timer> {
    const existing = await this.getById(id);
    if (!existing) throw new Error(`Timer not found: ${id}`);
    if (existing.type !== input.type) {
      throw new Error(`Timer type mismatch: expected '${existing.type}', got '${input.type}'`);
    }

    const now = new Date().toISOString();
    const updateValues: Partial<TimerInsert> = { updatedAt: now };

    if (input.name !== undefined) updateValues.name = input.name;
    if (input.tags !== undefined) {
      updateValues.tags = input.tags.length > 0 ? JSON.stringify(input.tags) : null;
    }
    if (input.priority !== undefined) updateValues.priority = input.priority;

    switch (input.type) {
      case 'countdown':
        if (input.targetDate !== undefined) updateValues.targetDate = input.targetDate;
        break;
      case 'elapsed':
        if (input.startDate !== undefined) updateValues.startDate = input.startDate;
        break;
      case 'countdown-elapsed':
        if (input.targetDate !== undefined) updateValues.targetDate = input.targetDate;
        break;
      case 'stamina':
        if (input.currentValue !== undefined) updateValues.currentValue = input.currentValue;
        if (input.maxValue !== undefined) updateValues.maxValue = input.maxValue;
        if (input.recoveryIntervalMinutes !== undefined) updateValues.recoveryIntervalMinutes = input.recoveryIntervalMinutes;
        if (input.recoveryIntervalSeconds !== undefined) updateValues.recoveryIntervalSeconds = input.recoveryIntervalSeconds;
        if (input.lastUpdatedAt !== undefined) updateValues.lastUpdatedAt = input.lastUpdatedAt;
        break;
      case 'periodic-increment':
        if (input.currentValue !== undefined) updateValues.currentValue = input.currentValue;
        if (input.maxValue !== undefined) updateValues.maxValue = input.maxValue;
        if (input.incrementAmount !== undefined) updateValues.incrementAmount = input.incrementAmount;
        if (input.scheduleTimes !== undefined) updateValues.scheduleTimes = JSON.stringify(input.scheduleTimes);
        if (input.lastUpdatedAt !== undefined) updateValues.lastUpdatedAt = input.lastUpdatedAt;
        break;
    }

    await this.db.update(timers).set(updateValues).where(eq(timers.id, id));
    return (await this.getById(id))!;
  }

  async delete(id: string): Promise<void> {
    const result = await this.db.delete(timers).where(eq(timers.id, id)).returning();
    if (result.length === 0) throw new Error(`Timer not found: ${id}`);
  }

  async archive(id: string): Promise<Timer> {
    const existing = await this.getById(id);
    if (!existing) throw new Error(`Timer not found: ${id}`);
    const now = new Date().toISOString();
    await this.db.update(timers).set({ archivedAt: now }).where(eq(timers.id, id));
    return (await this.getById(id))!;
  }

  async getByProjectId(projectId: string): Promise<Timer[]> {
    const rows = await this.db.select().from(timers)
      .where(and(eq(timers.projectId, projectId), isNull(timers.archivedAt)))
      .orderBy(desc(timers.createdAt));
    return rows.map(toTimer);
  }

  async updateProject(id: string, projectId: string | null): Promise<void> {
    const now = new Date().toISOString();
    await this.db.update(timers).set({ projectId, updatedAt: now }).where(eq(timers.id, id));
  }

  async updatePriority(id: string, priority: number): Promise<void> {
    const now = new Date().toISOString();
    await this.db.update(timers).set({ priority, updatedAt: now }).where(eq(timers.id, id));
  }

  async unarchive(id: string): Promise<Timer> {
    const existing = await this.getById(id);
    if (!existing) throw new Error(`Timer not found: ${id}`);
    await this.db.update(timers).set({ archivedAt: null }).where(eq(timers.id, id));
    return (await this.getById(id))!;
  }
}
