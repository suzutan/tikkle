'use client';

import { useState, useCallback, useRef } from 'react';
import type { Timer, CreateTimerInput, UpdateTimerInput } from '@/domain/timer/types';
import type { TimerRepository } from '@/storage/types';
import { LocalStorageTimerRepository } from '@/storage/local-storage';

function createRepository(): TimerRepository {
  return new LocalStorageTimerRepository();
}

export function useTimers() {
  const repoRef = useRef<TimerRepository | null>(null);
  if (!repoRef.current) {
    repoRef.current = createRepository();
  }
  const repo = repoRef.current;

  const [timers, setTimers] = useState<Timer[]>(() => repo.getAll());

  const createTimer = useCallback((input: CreateTimerInput): Timer => {
    const created = repo.create(input);
    setTimers(repo.getAll());
    return created;
  }, [repo]);

  const updateTimer = useCallback((id: string, input: UpdateTimerInput): Timer => {
    const updated = repo.update(id, input);
    setTimers(repo.getAll());
    return updated;
  }, [repo]);

  const deleteTimer = useCallback((id: string): void => {
    repo.delete(id);
    setTimers(repo.getAll());
  }, [repo]);

  return { timers, createTimer, updateTimer, deleteTimer };
}
