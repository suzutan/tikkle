import type { Timer, CreateTimerInput, UpdateTimerInput } from '@/domain/timer/types';

export interface TimerRepository {
  getAll(): Timer[];
  getById(id: string): Timer | undefined;
  create(input: CreateTimerInput): Timer;
  update(id: string, input: UpdateTimerInput): Timer;
  delete(id: string): void;
}
