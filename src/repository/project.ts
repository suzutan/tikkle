import { eq, asc, sql } from 'drizzle-orm';
import { drizzle, DrizzleD1Database } from 'drizzle-orm/d1';
import { projects, timers } from '../db/schema';
import type { Project, CreateProjectInput, UpdateProjectInput } from '../domain/project/types';

type ProjectRow = typeof projects.$inferSelect;

function toProject(row: ProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class D1ProjectRepository {
  private db: DrizzleD1Database;

  constructor(d1: D1Database) {
    this.db = drizzle(d1);
  }

  async getAll(): Promise<Project[]> {
    const rows = await this.db.select().from(projects).orderBy(asc(projects.sortOrder));
    return rows.map(toProject);
  }

  async getById(id: string): Promise<Project | undefined> {
    const rows = await this.db.select().from(projects).where(eq(projects.id, id)).limit(1);
    return rows.length > 0 ? toProject(rows[0]) : undefined;
  }

  async create(input: CreateProjectInput): Promise<Project> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    // 既存最大値 + 1
    const maxResult = await this.db
      .select({ maxOrder: sql<number>`COALESCE(MAX(${projects.sortOrder}), -1)` })
      .from(projects);
    const sortOrder = (maxResult[0]?.maxOrder ?? -1) + 1;

    await this.db.insert(projects).values({
      id,
      name: input.name,
      sortOrder,
      createdAt: now,
      updatedAt: now,
    });
    return (await this.getById(id))!;
  }

  async update(id: string, input: UpdateProjectInput): Promise<Project> {
    const existing = await this.getById(id);
    if (!existing) throw new Error(`Project not found: ${id}`);

    const now = new Date().toISOString();
    const updateValues: Partial<typeof projects.$inferInsert> = { updatedAt: now };

    if (input.name !== undefined) updateValues.name = input.name;
    if (input.sortOrder !== undefined) updateValues.sortOrder = input.sortOrder;

    await this.db.update(projects).set(updateValues).where(eq(projects.id, id));
    return (await this.getById(id))!;
  }

  async delete(id: string): Promise<void> {
    // アトミック操作: 所属タイマーの projectId を null → プロジェクト削除
    const d1 = (this.db as any).session?.client;
    if (d1?.batch) {
      // D1 batch API が利用可能な場合
      const clearTimers = this.db.update(timers).set({ projectId: null }).where(eq(timers.projectId, id));
      const deleteProject = this.db.delete(projects).where(eq(projects.id, id));
      await d1.batch([clearTimers, deleteProject]);
    } else {
      // フォールバック: 順次実行
      await this.db.update(timers).set({ projectId: null }).where(eq(timers.projectId, id));
      await this.db.delete(projects).where(eq(projects.id, id));
    }
  }
}
