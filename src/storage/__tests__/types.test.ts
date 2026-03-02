import { describe, test, expect, vi } from 'vitest';
import type { TimerRepository } from '../types';
import { LocalStorageTimerRepository } from '../local-storage';

const mockStorage = new Map<string, string>();

const localStorageMock = {
  getItem: vi.fn((key: string) => mockStorage.get(key) ?? null),
  setItem: vi.fn((key: string, value: string) => {
    mockStorage.set(key, value);
  }),
  removeItem: vi.fn((key: string) => {
    mockStorage.delete(key);
  }),
  clear: vi.fn(() => {
    mockStorage.clear();
  }),
  get length() {
    return mockStorage.size;
  },
  key: vi.fn((_index: number) => null),
};

vi.stubGlobal('localStorage', localStorageMock);

describe('TimerRepository interface', () => {
  test('should be satisfied by LocalStorageTimerRepository', () => {
    // Given: assignment to TimerRepository is a compile-time contract check
    const repo: TimerRepository = new LocalStorageTimerRepository();

    // Then: all interface methods exist
    expect(typeof repo.getAll).toBe('function');
    expect(typeof repo.getById).toBe('function');
    expect(typeof repo.create).toBe('function');
    expect(typeof repo.update).toBe('function');
    expect(typeof repo.delete).toBe('function');
  });

  test('should define getAll returning an array', () => {
    // Given
    const repo: TimerRepository = new LocalStorageTimerRepository();

    // When
    const result = repo.getAll();

    // Then
    expect(Array.isArray(result)).toBe(true);
  });

  test('should define getById returning undefined for non-existent id', () => {
    // Given
    const repo: TimerRepository = new LocalStorageTimerRepository();

    // When
    const result = repo.getById('non-existent');

    // Then
    expect(result).toBeUndefined();
  });
});
