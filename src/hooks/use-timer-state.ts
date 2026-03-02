'use client';

import { useState, useEffect } from 'react';
import type { Timer, TimerState } from '@/domain/timer/types';
import { computeTimerState } from '@/domain/timer/compute';

const INTERVAL_MS = 1_000;

export function useTimerState(timer: Timer): TimerState {
  const [state, setState] = useState<TimerState>(() =>
    computeTimerState(timer, new Date()),
  );

  useEffect(() => {
    setState(computeTimerState(timer, new Date()));

    const intervalId = setInterval(() => {
      setState(computeTimerState(timer, new Date()));
    }, INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [timer]);

  return state;
}
