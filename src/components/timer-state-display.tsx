'use client';

import type { Timer, TimerState } from '@/domain/timer/types';
import { formatDuration, formatFraction } from '@/domain/timer/format';
import { useTimerState } from '@/hooks/use-timer-state';
import { Progress } from '@/components/ui/progress';

function CountdownDisplay({ state }: { state: Extract<TimerState, { type: 'countdown' }> }) {
  return (
    <div>
      {state.isExpired ? (
        <p className="text-2xl font-mono text-red-600">期限切れ</p>
      ) : (
        <p className="text-2xl font-mono">{formatDuration(state.remainingMs)}</p>
      )}
    </div>
  );
}

function ElapsedDisplay({ state }: { state: Extract<TimerState, { type: 'elapsed' }> }) {
  return (
    <div>
      <p className="text-2xl font-mono">{formatDuration(state.elapsedMs)}</p>
    </div>
  );
}

function CountdownElapsedDisplay({ state }: { state: Extract<TimerState, { type: 'countdown-elapsed' }> }) {
  const label = state.mode === 'countdown' ? '残り' : '超過';
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-mono">{formatDuration(state.ms)}</p>
    </div>
  );
}

function StaminaDisplay({ state }: { state: Extract<TimerState, { type: 'stamina' }> }) {
  const percentage = (state.currentValue / state.maxValue) * 100;
  return (
    <div>
      <p className="text-2xl font-mono">{formatFraction(state.currentValue, state.maxValue)}</p>
      <Progress className="mt-2" value={percentage} indicatorClassName="bg-green-500" />
      {!state.isFull && (
        <p className="mt-1 text-sm text-gray-500">
          次の回復: {formatDuration(state.nextRecoveryMs)}
        </p>
      )}
    </div>
  );
}

function PeriodicIncrementDisplay({ state }: { state: Extract<TimerState, { type: 'periodic-increment' }> }) {
  const percentage = (state.currentValue / state.maxValue) * 100;
  return (
    <div>
      <p className="text-2xl font-mono">{formatFraction(state.currentValue, state.maxValue)}</p>
      <Progress className="mt-2" value={percentage} indicatorClassName="bg-blue-500" />
      {!state.isAtMax && state.nextIncrementAt && (
        <p className="mt-1 text-sm text-gray-500">
          全回復まで: {formatDuration(state.timeToMaxMs)}
        </p>
      )}
    </div>
  );
}

const STATE_RENDERERS: Record<TimerState['type'], React.ComponentType<{ state: never }>> = {
  'countdown': CountdownDisplay as React.ComponentType<{ state: never }>,
  'elapsed': ElapsedDisplay as React.ComponentType<{ state: never }>,
  'countdown-elapsed': CountdownElapsedDisplay as React.ComponentType<{ state: never }>,
  'stamina': StaminaDisplay as React.ComponentType<{ state: never }>,
  'periodic-increment': PeriodicIncrementDisplay as React.ComponentType<{ state: never }>,
};

export function TimerStateDisplay({ timer }: { timer: Timer }) {
  const state = useTimerState(timer);
  const Renderer = STATE_RENDERERS[state.type];

  return <Renderer state={state as never} />;
}
