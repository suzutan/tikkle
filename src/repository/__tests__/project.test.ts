import { describe, test, expect, vi, beforeEach } from 'vitest';
import { D1ProjectRepository } from '../project';

// Drizzle ORM のモックを作成
const mockDbInstance = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  orderBy: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  values: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
};

vi.mock('drizzle-orm/d1', () => ({
  drizzle: vi.fn(() => mockDbInstance),
}));

describe('D1ProjectRepository', () => {
  let mockD1: D1Database;
  let repo: D1ProjectRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    mockDbInstance.select.mockReturnThis();
    mockDbInstance.from.mockReturnThis();
    mockDbInstance.where.mockReturnThis();
    mockDbInstance.orderBy.mockReturnThis();
    mockDbInstance.limit.mockReturnThis();
    mockDbInstance.insert.mockReturnThis();
    mockDbInstance.values.mockReturnThis();
    mockDbInstance.update.mockReturnThis();
    mockDbInstance.set.mockReturnThis();
    mockDbInstance.delete.mockReturnThis();

    mockD1 = {} as D1Database;
    repo = new D1ProjectRepository(mockD1);
  });

  test('getAll でプロジェクト一覧を取得できる', async () => {
    // Given: DBに2つのプロジェクトが存在する
    const mockRows = [
      {
        id: 'proj-1',
        name: 'Project A',
        sortOrder: 0,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'proj-2',
        name: 'Project B',
        sortOrder: 1,
        createdAt: '2026-01-02T00:00:00.000Z',
        updatedAt: '2026-01-02T00:00:00.000Z',
      },
    ];
    mockDbInstance.orderBy.mockResolvedValue(mockRows);

    // When: getAll を呼ぶ
    const projects = await repo.getAll();

    // Then: 2つのプロジェクトが返される
    expect(projects).toHaveLength(2);
    expect(projects[0].name).toBe('Project A');
    expect(projects[1].name).toBe('Project B');
  });

  test('getById でプロジェクトを1件取得できる', async () => {
    // Given: DBにプロジェクトが存在する
    const mockRow = {
      id: 'proj-1',
      name: 'Project A',
      sortOrder: 0,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };
    mockDbInstance.limit.mockResolvedValue([mockRow]);

    // When: getById を呼ぶ
    const project = await repo.getById('proj-1');

    // Then: プロジェクトが返される
    expect(project).toBeDefined();
    expect(project?.name).toBe('Project A');
    expect(project?.sortOrder).toBe(0);
  });

  test('getById でプロジェクトが見つからない場合は undefined を返す', async () => {
    // Given: DBにプロジェクトが存在しない
    mockDbInstance.limit.mockResolvedValue([]);

    // When: getById を呼ぶ
    const project = await repo.getById('non-existent');

    // Then: undefined が返される
    expect(project).toBeUndefined();
  });

  test('create でプロジェクトを作成できる', async () => {
    // Given: プロジェクト作成入力
    const input = { name: 'New Project' };

    // maxOrder の取得結果をモック
    mockDbInstance.from.mockReturnThis();
    mockDbInstance.select.mockReturnThis();
    // 最初の select().from() は maxOrder 取得、次は getById
    const mockCreatedRow = {
      id: expect.any(String),
      name: 'New Project',
      sortOrder: 1,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    };
    // maxOrder query returns [{ maxOrder: 0 }]
    mockDbInstance.from
      .mockResolvedValueOnce([{ maxOrder: 0 }])  // maxOrder query
      .mockReturnThis();                           // subsequent calls
    mockDbInstance.values.mockResolvedValue(undefined);
    mockDbInstance.limit.mockResolvedValue([mockCreatedRow]);

    // When: create を呼ぶ
    const project = await repo.create(input);

    // Then: プロジェクトが作成される
    expect(project).toBeDefined();
    expect(project.name).toBe('New Project');
    expect(mockDbInstance.insert).toHaveBeenCalled();
  });

  test('update でプロジェクトを更新できる', async () => {
    // Given: DBにプロジェクトが存在する
    const existingRow = {
      id: 'proj-1',
      name: 'Old Name',
      sortOrder: 0,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };
    const updatedRow = { ...existingRow, name: 'New Name' };
    mockDbInstance.limit
      .mockResolvedValueOnce([existingRow])  // getById (existing)
      .mockResolvedValueOnce([updatedRow]);  // getById (after update)

    // When: update を呼ぶ
    const project = await repo.update('proj-1', { name: 'New Name' });

    // Then: プロジェクトが更新される
    expect(project).toBeDefined();
    expect(project.name).toBe('New Name');
    expect(mockDbInstance.update).toHaveBeenCalled();
    expect(mockDbInstance.set).toHaveBeenCalled();
  });

  test('update でプロジェクトが存在しない場合はエラーを投げる', async () => {
    // Given: DBにプロジェクトが存在しない
    mockDbInstance.limit.mockResolvedValueOnce([]);

    // When/Then: update を呼ぶとエラーが投げられる
    await expect(
      repo.update('non-existent', { name: 'Updated' }),
    ).rejects.toThrow('Project not found');
  });

  test('delete でプロジェクトを削除できる（フォールバック）', async () => {
    // Given: D1 batch API が利用不可能な環境

    // When: delete を呼ぶ
    await repo.delete('proj-1');

    // Then: タイマーの projectId クリア → プロジェクト削除が実行される
    expect(mockDbInstance.update).toHaveBeenCalled();
    expect(mockDbInstance.set).toHaveBeenCalled();
    expect(mockDbInstance.delete).toHaveBeenCalled();
  });
});
