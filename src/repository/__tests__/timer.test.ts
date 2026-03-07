import { describe, test, expect, vi, beforeEach } from 'vitest';
import { toTimer, toInsertValues, D1TimerRepository } from '../timer';
import type { CreateTimerInput } from '../../domain/timer/types';

describe('toTimer', () => {
  test('countdown timer を正しく変換できる', () => {
    // Given: countdown timer row
    const row = {
      id: 'timer-1',
      name: 'Test Countdown',
      type: 'countdown' as const,
      targetDate: '2026-12-31T00:00:00.000Z',
      tags: '["work","important"]',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      startDate: null,
      currentValue: null,
      maxValue: null,
      recoveryIntervalMinutes: null,
      recoveryIntervalSeconds: null,
      incrementAmount: null,
      scheduleTimes: null,
      lastUpdatedAt: null,
    };

    // When: toTimer を呼ぶ
    const timer = toTimer(row);

    // Then: countdown timer が返される
    expect(timer).toEqual({
      id: 'timer-1',
      name: 'Test Countdown',
      type: 'countdown',
      targetDate: '2026-12-31T00:00:00.000Z',
      tags: ['work', 'important'],
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
  });

  test('elapsed timer を正しく変換できる', () => {
    // Given: elapsed timer row
    const row = {
      id: 'timer-2',
      name: 'Test Elapsed',
      type: 'elapsed' as const,
      startDate: '2026-01-01T00:00:00.000Z',
      tags: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      targetDate: null,
      currentValue: null,
      maxValue: null,
      recoveryIntervalMinutes: null,
      recoveryIntervalSeconds: null,
      incrementAmount: null,
      scheduleTimes: null,
      lastUpdatedAt: null,
    };

    // When: toTimer を呼ぶ
    const timer = toTimer(row);

    // Then: elapsed timer が返される
    expect(timer).toEqual({
      id: 'timer-2',
      name: 'Test Elapsed',
      type: 'elapsed',
      startDate: '2026-01-01T00:00:00.000Z',
      tags: undefined,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
  });

  test('countdown-elapsed timer を正しく変換できる', () => {
    // Given: countdown-elapsed timer row
    const row = {
      id: 'timer-3',
      name: 'Test Countdown-Elapsed',
      type: 'countdown-elapsed' as const,
      targetDate: '2026-12-31T00:00:00.000Z',
      tags: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      startDate: null,
      currentValue: null,
      maxValue: null,
      recoveryIntervalMinutes: null,
      recoveryIntervalSeconds: null,
      incrementAmount: null,
      scheduleTimes: null,
      lastUpdatedAt: null,
    };

    // When: toTimer を呼ぶ
    const timer = toTimer(row);

    // Then: countdown-elapsed timer が返される
    expect(timer).toEqual({
      id: 'timer-3',
      name: 'Test Countdown-Elapsed',
      type: 'countdown-elapsed',
      targetDate: '2026-12-31T00:00:00.000Z',
      tags: undefined,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
  });

  test('stamina timer を正しく変換できる', () => {
    // Given: stamina timer row
    const row = {
      id: 'timer-4',
      name: 'Test Stamina',
      type: 'stamina' as const,
      currentValue: 50,
      maxValue: 100,
      recoveryIntervalMinutes: 5,
      lastUpdatedAt: '2026-01-01T00:00:00.000Z',
      tags: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      targetDate: null,
      startDate: null,
      recoveryIntervalSeconds: null,
      incrementAmount: null,
      scheduleTimes: null,
    };

    // When: toTimer を呼ぶ
    const timer = toTimer(row);

    // Then: stamina timer が返される
    expect(timer).toEqual({
      id: 'timer-4',
      name: 'Test Stamina',
      type: 'stamina',
      currentValue: 50,
      maxValue: 100,
      recoveryIntervalMinutes: 5,
      lastUpdatedAt: '2026-01-01T00:00:00.000Z',
      tags: undefined,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
  });

  test('periodic-increment timer を正しく変換できる', () => {
    // Given: periodic-increment timer row
    const row = {
      id: 'timer-5',
      name: 'Test Periodic',
      type: 'periodic-increment' as const,
      currentValue: 30,
      maxValue: 100,
      incrementAmount: 10,
      scheduleTimes: '["06:00","12:00","18:00"]',
      lastUpdatedAt: '2026-01-01T00:00:00.000Z',
      tags: '["game"]',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      targetDate: null,
      startDate: null,
      recoveryIntervalMinutes: null,
      recoveryIntervalSeconds: null,
    };

    // When: toTimer を呼ぶ
    const timer = toTimer(row);

    // Then: periodic-increment timer が返される
    expect(timer).toEqual({
      id: 'timer-5',
      name: 'Test Periodic',
      type: 'periodic-increment',
      currentValue: 30,
      maxValue: 100,
      incrementAmount: 10,
      scheduleTimes: ['06:00', '12:00', '18:00'],
      lastUpdatedAt: '2026-01-01T00:00:00.000Z',
      tags: ['game'],
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
  });

  test('不明なタイマー種別でエラーを投げる', () => {
    // Given: unknown timer type row
    const row = {
      id: 'timer-6',
      name: 'Unknown Timer',
      type: 'unknown' as any,
      tags: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      targetDate: null,
      startDate: null,
      currentValue: null,
      maxValue: null,
      recoveryIntervalMinutes: null,
      recoveryIntervalSeconds: null,
      incrementAmount: null,
      scheduleTimes: null,
      lastUpdatedAt: null,
    };

    // When/Then: toTimer を呼ぶとエラーが投げられる
    expect(() => toTimer(row)).toThrow('Unknown timer type: unknown');
  });
});

describe('toInsertValues', () => {
  test('countdown timer の insert values を正しく作成できる', () => {
    // Given: countdown timer input
    const input: CreateTimerInput = {
      name: 'New Countdown',
      type: 'countdown',
      targetDate: '2026-12-31T00:00:00.000Z',
      tags: ['work', 'important'],
    };
    const id = 'new-timer-1';
    const now = '2026-01-01T00:00:00.000Z';

    // When: toInsertValues を呼ぶ
    const values = toInsertValues(input, id, now);

    // Then: insert values が返される
    expect(values).toEqual({
      id: 'new-timer-1',
      name: 'New Countdown',
      type: 'countdown',
      targetDate: '2026-12-31T00:00:00.000Z',
      tags: '["work","important"]',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
  });

  test('elapsed timer の insert values を正しく作成できる', () => {
    // Given: elapsed timer input
    const input: CreateTimerInput = {
      name: 'New Elapsed',
      type: 'elapsed',
      startDate: '2026-01-01T00:00:00.000Z',
    };
    const id = 'new-timer-2';
    const now = '2026-01-01T00:00:00.000Z';

    // When: toInsertValues を呼ぶ
    const values = toInsertValues(input, id, now);

    // Then: insert values が返される
    expect(values).toEqual({
      id: 'new-timer-2',
      name: 'New Elapsed',
      type: 'elapsed',
      startDate: '2026-01-01T00:00:00.000Z',
      tags: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
  });

  test('stamina timer の insert values を正しく作成できる', () => {
    // Given: stamina timer input
    const input: CreateTimerInput = {
      name: 'New Stamina',
      type: 'stamina',
      currentValue: 50,
      maxValue: 100,
      recoveryIntervalMinutes: 5,
      lastUpdatedAt: '2026-01-01T00:00:00.000Z',
    };
    const id = 'new-timer-3';
    const now = '2026-01-01T00:00:00.000Z';

    // When: toInsertValues を呼ぶ
    const values = toInsertValues(input, id, now);

    // Then: insert values が返される
    expect(values).toEqual({
      id: 'new-timer-3',
      name: 'New Stamina',
      type: 'stamina',
      currentValue: 50,
      maxValue: 100,
      recoveryIntervalMinutes: 5,
      lastUpdatedAt: '2026-01-01T00:00:00.000Z',
      tags: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
  });

  test('periodic-increment timer の insert values を正しく作成できる', () => {
    // Given: periodic-increment timer input
    const input: CreateTimerInput = {
      name: 'New Periodic',
      type: 'periodic-increment',
      currentValue: 30,
      maxValue: 100,
      incrementAmount: 10,
      scheduleTimes: ['06:00', '12:00', '18:00'],
      lastUpdatedAt: '2026-01-01T00:00:00.000Z',
      tags: ['game'],
    };
    const id = 'new-timer-4';
    const now = '2026-01-01T00:00:00.000Z';

    // When: toInsertValues を呼ぶ
    const values = toInsertValues(input, id, now);

    // Then: insert values が返される
    expect(values).toEqual({
      id: 'new-timer-4',
      name: 'New Periodic',
      type: 'periodic-increment',
      currentValue: 30,
      maxValue: 100,
      incrementAmount: 10,
      scheduleTimes: '["06:00","12:00","18:00"]',
      lastUpdatedAt: '2026-01-01T00:00:00.000Z',
      tags: '["game"]',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
  });

  test('countdown-elapsed timer の insert values を正しく作成できる', () => {
    // Given: countdown-elapsed timer input
    const input: CreateTimerInput = {
      name: 'New Countdown-Elapsed',
      type: 'countdown-elapsed',
      targetDate: '2026-12-31T00:00:00.000Z',
    };
    const id = 'new-timer-6';
    const now = '2026-01-01T00:00:00.000Z';

    // When: toInsertValues を呼ぶ
    const values = toInsertValues(input, id, now);

    // Then: insert values が返される
    expect(values).toEqual({
      id: 'new-timer-6',
      name: 'New Countdown-Elapsed',
      type: 'countdown-elapsed',
      targetDate: '2026-12-31T00:00:00.000Z',
      tags: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });
  });

  test('tags が空配列の場合は null になる', () => {
    // Given: countdown timer input with empty tags
    const input: CreateTimerInput = {
      name: 'No Tags Timer',
      type: 'countdown',
      targetDate: '2026-12-31T00:00:00.000Z',
      tags: [],
    };
    const id = 'new-timer-5';
    const now = '2026-01-01T00:00:00.000Z';

    // When: toInsertValues を呼ぶ
    const values = toInsertValues(input, id, now);

    // Then: tags が null になる
    expect(values.tags).toBeNull();
  });
});

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
  returning: vi.fn().mockResolvedValue([]),
};

vi.mock('drizzle-orm/d1', () => ({
  drizzle: vi.fn(() => mockDbInstance),
}));

describe('D1TimerRepository', () => {
  let mockD1: D1Database;
  let repo: D1TimerRepository;

  beforeEach(() => {
    // モックをリセット
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
    mockDbInstance.returning.mockResolvedValue([]);

    mockD1 = {} as D1Database;
    repo = new D1TimerRepository(mockD1);
  });

  test('getAll で全タイマーを取得できる', async () => {
    // Given: DBに2つのタイマーが存在する
    const mockRows = [
      {
        id: 'timer-1',
        name: 'Timer 1',
        type: 'countdown' as const,
        targetDate: '2026-12-31T00:00:00.000Z',
        tags: null,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        startDate: null,
        currentValue: null,
        maxValue: null,
        recoveryIntervalMinutes: null,
        recoveryIntervalSeconds: null,
        incrementAmount: null,
        scheduleTimes: null,
        lastUpdatedAt: null,
      },
      {
        id: 'timer-2',
        name: 'Timer 2',
        type: 'elapsed' as const,
        startDate: '2026-01-01T00:00:00.000Z',
        tags: null,
        createdAt: '2026-01-02T00:00:00.000Z',
        updatedAt: '2026-01-02T00:00:00.000Z',
        targetDate: null,
        currentValue: null,
        maxValue: null,
        recoveryIntervalMinutes: null,
        recoveryIntervalSeconds: null,
        incrementAmount: null,
        scheduleTimes: null,
        lastUpdatedAt: null,
      },
    ];
    mockDbInstance.orderBy.mockResolvedValue(mockRows);

    // When: getAll を呼ぶ
    const timers = await repo.getAll();

    // Then: 2つのタイマーが返される
    expect(timers).toHaveLength(2);
    expect(timers[0].name).toBe('Timer 1');
    expect(timers[1].name).toBe('Timer 2');
  });

  test('getById でタイマーを1件取得できる', async () => {
    // Given: DBにタイマーが存在する
    const mockRow = {
      id: 'timer-1',
      name: 'Timer 1',
      type: 'countdown' as const,
      targetDate: '2026-12-31T00:00:00.000Z',
      tags: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      startDate: null,
      currentValue: null,
      maxValue: null,
      recoveryIntervalMinutes: null,
      recoveryIntervalSeconds: null,
      incrementAmount: null,
      scheduleTimes: null,
      lastUpdatedAt: null,
    };
    mockDbInstance.limit.mockResolvedValue([mockRow]);

    // When: getById を呼ぶ
    const timer = await repo.getById('timer-1');

    // Then: タイマーが返される
    expect(timer).toBeDefined();
    expect(timer?.name).toBe('Timer 1');
  });

  test('getById でタイマーが見つからない場合は undefined を返す', async () => {
    // Given: DBにタイマーが存在しない
    mockDbInstance.limit.mockResolvedValue([]);

    // When: getById を呼ぶ
    const timer = await repo.getById('non-existent');

    // Then: undefined が返される
    expect(timer).toBeUndefined();
  });

  test('create でタイマーを作成できる', async () => {
    // Given: タイマー作成入力
    const input: CreateTimerInput = {
      name: 'New Timer',
      type: 'countdown',
      targetDate: '2026-12-31T00:00:00.000Z',
    };

    // モックを設定（create後のgetByIdの結果）
    const mockCreatedRow = {
      id: expect.any(String),
      name: 'New Timer',
      type: 'countdown' as const,
      targetDate: '2026-12-31T00:00:00.000Z',
      tags: null,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      startDate: null,
      currentValue: null,
      maxValue: null,
      recoveryIntervalMinutes: null,
      recoveryIntervalSeconds: null,
      incrementAmount: null,
      scheduleTimes: null,
      lastUpdatedAt: null,
    };
    mockDbInstance.values.mockResolvedValue(undefined);
    mockDbInstance.limit.mockResolvedValue([mockCreatedRow]);

    // When: create を呼ぶ
    const timer = await repo.create(input);

    // Then: タイマーが作成される
    expect(timer).toBeDefined();
    expect(timer.name).toBe('New Timer');
    expect(mockDbInstance.insert).toHaveBeenCalled();
  });

  test('delete でタイマーを削除できる', async () => {
    // Given: DBにタイマーが存在する
    mockDbInstance.returning.mockResolvedValue([{ id: 'timer-1' }]);

    // When: delete を呼ぶ
    await repo.delete('timer-1');

    // Then: 削除処理が実行される
    expect(mockDbInstance.delete).toHaveBeenCalled();
  });

  test('delete でタイマーが見つからない場合はエラーを投げる', async () => {
    // Given: DBにタイマーが存在しない
    mockDbInstance.returning.mockResolvedValue([]);

    // When/Then: delete を呼ぶとエラーが投げられる
    await expect(repo.delete('non-existent')).rejects.toThrow('Timer not found');
  });

  test('update でcountdownタイマーを更新できる', async () => {
    // Given: DBにcountdownタイマーが存在する
    const existingRow = {
      id: 'timer-1',
      name: 'Existing Timer',
      type: 'countdown' as const,
      targetDate: '2026-12-31T00:00:00.000Z',
      tags: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      startDate: null,
      currentValue: null,
      maxValue: null,
      recoveryIntervalMinutes: null,
      recoveryIntervalSeconds: null,
      incrementAmount: null,
      scheduleTimes: null,
      lastUpdatedAt: null,
    };
    const updatedRow = { ...existingRow, name: 'Updated Timer', targetDate: '2027-06-30T00:00:00.000Z' };
    mockDbInstance.limit
      .mockResolvedValueOnce([existingRow])  // getById (existing)
      .mockResolvedValueOnce([updatedRow]);  // getById (after update)

    // When: update を呼ぶ
    const timer = await repo.update('timer-1', {
      type: 'countdown',
      name: 'Updated Timer',
      targetDate: '2027-06-30T00:00:00.000Z',
    });

    // Then: タイマーが更新される
    expect(timer).toBeDefined();
    expect(timer.name).toBe('Updated Timer');
    expect(mockDbInstance.update).toHaveBeenCalled();
    expect(mockDbInstance.set).toHaveBeenCalled();
  });

  test('update でタイマーが存在しない場合はエラーを投げる', async () => {
    // Given: DBにタイマーが存在しない
    mockDbInstance.limit.mockResolvedValueOnce([]);

    // When/Then: update を呼ぶとエラーが投げられる
    await expect(
      repo.update('non-existent', { type: 'countdown', name: 'Updated' }),
    ).rejects.toThrow('Timer not found');
  });

  test('update でタイプが異なる場合はエラーを投げる', async () => {
    // Given: DBにcountdownタイマーが存在するが、elapsedとして更新しようとする
    const existingRow = {
      id: 'timer-1',
      name: 'Existing Timer',
      type: 'countdown' as const,
      targetDate: '2026-12-31T00:00:00.000Z',
      tags: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      startDate: null,
      currentValue: null,
      maxValue: null,
      recoveryIntervalMinutes: null,
      recoveryIntervalSeconds: null,
      incrementAmount: null,
      scheduleTimes: null,
      lastUpdatedAt: null,
    };
    mockDbInstance.limit.mockResolvedValueOnce([existingRow]);

    // When/Then: タイプ不一致でエラーが投げられる
    await expect(
      repo.update('timer-1', { type: 'elapsed', name: 'Updated' }),
    ).rejects.toThrow('Timer type mismatch');
  });

  test('update でelapsedタイマーを更新できる', async () => {
    // Given: DBにelapsedタイマーが存在する
    const existingRow = {
      id: 'timer-2',
      name: 'Elapsed Timer',
      type: 'elapsed' as const,
      startDate: '2026-01-01T00:00:00.000Z',
      tags: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      targetDate: null,
      currentValue: null,
      maxValue: null,
      recoveryIntervalMinutes: null,
      recoveryIntervalSeconds: null,
      incrementAmount: null,
      scheduleTimes: null,
      lastUpdatedAt: null,
    };
    const updatedRow = { ...existingRow, startDate: '2026-02-01T00:00:00.000Z' };
    mockDbInstance.limit
      .mockResolvedValueOnce([existingRow])
      .mockResolvedValueOnce([updatedRow]);

    // When: update を呼ぶ
    const timer = await repo.update('timer-2', {
      type: 'elapsed',
      startDate: '2026-02-01T00:00:00.000Z',
    });

    // Then: タイマーが更新される
    expect(timer).toBeDefined();
    expect(mockDbInstance.update).toHaveBeenCalled();
  });

  test('update でcountdown-elapsedタイマーを更新できる', async () => {
    // Given: DBにcountdown-elapsedタイマーが存在する
    const existingRow = {
      id: 'timer-3',
      name: 'Countdown-Elapsed Timer',
      type: 'countdown-elapsed' as const,
      targetDate: '2026-12-31T00:00:00.000Z',
      tags: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      startDate: null,
      currentValue: null,
      maxValue: null,
      recoveryIntervalMinutes: null,
      recoveryIntervalSeconds: null,
      incrementAmount: null,
      scheduleTimes: null,
      lastUpdatedAt: null,
    };
    const updatedRow = { ...existingRow, targetDate: '2027-06-30T00:00:00.000Z' };
    mockDbInstance.limit
      .mockResolvedValueOnce([existingRow])
      .mockResolvedValueOnce([updatedRow]);

    // When: update を呼ぶ
    const timer = await repo.update('timer-3', {
      type: 'countdown-elapsed',
      targetDate: '2027-06-30T00:00:00.000Z',
    });

    // Then: タイマーが更新される
    expect(timer).toBeDefined();
    expect(mockDbInstance.update).toHaveBeenCalled();
  });

  test('update でstaminaタイマーを更新できる', async () => {
    // Given: DBにstaminaタイマーが存在する
    const existingRow = {
      id: 'timer-4',
      name: 'Stamina Timer',
      type: 'stamina' as const,
      currentValue: 50,
      maxValue: 100,
      recoveryIntervalMinutes: 5,
      lastUpdatedAt: '2026-01-01T00:00:00.000Z',
      tags: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      targetDate: null,
      startDate: null,
      recoveryIntervalSeconds: null,
      incrementAmount: null,
      scheduleTimes: null,
    };
    const updatedRow = { ...existingRow, currentValue: 80 };
    mockDbInstance.limit
      .mockResolvedValueOnce([existingRow])
      .mockResolvedValueOnce([updatedRow]);

    // When: update を呼ぶ
    const timer = await repo.update('timer-4', {
      type: 'stamina',
      currentValue: 80,
      maxValue: 100,
      recoveryIntervalMinutes: 5,
      lastUpdatedAt: '2026-01-02T00:00:00.000Z',
    });

    // Then: タイマーが更新される
    expect(timer).toBeDefined();
    expect(mockDbInstance.update).toHaveBeenCalled();
  });

  test('update でperiodic-incrementタイマーを更新できる', async () => {
    // Given: DBにperiodic-incrementタイマーが存在する
    const existingRow = {
      id: 'timer-5',
      name: 'Periodic Timer',
      type: 'periodic-increment' as const,
      currentValue: 30,
      maxValue: 100,
      incrementAmount: 10,
      scheduleTimes: '["06:00","12:00","18:00"]',
      lastUpdatedAt: '2026-01-01T00:00:00.000Z',
      tags: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      targetDate: null,
      startDate: null,
      recoveryIntervalMinutes: null,
      recoveryIntervalSeconds: null,
    };
    const updatedRow = { ...existingRow, currentValue: 40 };
    mockDbInstance.limit
      .mockResolvedValueOnce([existingRow])
      .mockResolvedValueOnce([updatedRow]);

    // When: update を呼ぶ
    const timer = await repo.update('timer-5', {
      type: 'periodic-increment',
      currentValue: 40,
      maxValue: 100,
      incrementAmount: 10,
      scheduleTimes: ['06:00', '12:00', '18:00'],
      lastUpdatedAt: '2026-01-02T00:00:00.000Z',
    });

    // Then: タイマーが更新される
    expect(timer).toBeDefined();
    expect(mockDbInstance.update).toHaveBeenCalled();
  });
});
