'use client';

import { useMemo, useRef } from 'react';
import type { Timer } from '@/domain/timer/types';
import type { TimerRepository } from '@/storage/types';
import { LocalStorageTimerRepository } from '@/storage/local-storage';

export function useTimer(id: string): Timer | undefined {
  const repoRef = useRef<TimerRepository | null>(null);
  if (!repoRef.current) {
    repoRef.current = new LocalStorageTimerRepository();
  }
  const repo = repoRef.current;

  return useMemo(() => repo.getById(id), [repo, id]);
}
