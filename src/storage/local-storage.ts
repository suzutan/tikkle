import type {
  Timer,
  CreateTimerInput,
  UpdateTimerInput,
} from '../domain/timer/types';
import type { TimerRepository } from './types';

const STORAGE_KEY = 'tikkle-timers';

export class LocalStorageTimerRepository implements TimerRepository {
  getAll(): Timer[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as Timer[];
    } catch {
      return [];
    }
  }

  getById(id: string): Timer | undefined {
    return this.getAll().find((t) => t.id === id);
  }

  create(input: CreateTimerInput): Timer {
    const timers = this.getAll();
    const now = new Date().toISOString();

    const timer: Timer = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    } as Timer;

    this.save([...timers, timer]);
    return timer;
  }

  update(id: string, input: UpdateTimerInput): Timer {
    const timers = this.getAll();
    const index = timers.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new Error(`Timer not found: ${id}`);
    }

    const existing = timers[index];
    if (existing.type !== input.type) {
      throw new Error(
        `Timer type mismatch: expected '${existing.type}', got '${input.type}'`,
      );
    }

    const updated = {
      ...existing,
      ...input,
      updatedAt: new Date().toISOString(),
    } as Timer;

    const newTimers = timers.map((t, i) => (i === index ? updated : t));
    this.save(newTimers);
    return updated;
  }

  delete(id: string): void {
    const timers = this.getAll();
    const index = timers.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new Error(`Timer not found: ${id}`);
    }

    const newTimers = timers.filter((t) => t.id !== id);
    this.save(newTimers);
  }

  private save(timers: Timer[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(timers));
  }
}
