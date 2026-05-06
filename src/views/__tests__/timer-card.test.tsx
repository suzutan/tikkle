import { describe, test, expect } from 'vitest';
import type { CountdownTimer } from '../../domain/timer/types';
import { TimerCard, TimerListItem } from '../timer-card';

function createTimer(): CountdownTimer {
  return {
    id: 'timer-1',
    name: 'Test Timer',
    type: 'countdown',
    targetDate: '2099-01-01T00:00:00.000Z',
    priority: 4,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  };
}

describe('TimerCard', () => {
  test('delete button targets closest [data-timer-card] wrapper', () => {
    // Given
    const timer = createTimer();

    // When
    const html = (<TimerCard timer={timer} />).toString();

    // Then
    expect(html).toContain('hx-target="closest [data-timer-card]"');
    expect(html).toContain(`hx-delete="/api/timers/${timer.id}"`);
    expect(html).toContain('hx-swap="outerHTML"');
  });
});

describe('TimerListItem', () => {
  test('delete button targets closest [data-timer-card] wrapper', () => {
    // Given
    const timer = createTimer();

    // When
    const html = (<TimerListItem timer={timer} />).toString();

    // Then
    expect(html).toContain('hx-target="closest [data-timer-card]"');
    expect(html).toContain(`hx-delete="/api/timers/${timer.id}"`);
    expect(html).toContain('hx-swap="outerHTML"');
  });
});
