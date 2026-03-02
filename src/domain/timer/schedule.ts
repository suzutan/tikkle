function parseTime(time: string): { hours: number; minutes: number } {
  const [hours, minutes] = time.split(':').map(Number);
  return { hours, minutes };
}

export function countScheduledEvents(
  scheduleTimes: string[],
  from: Date,
  to: Date,
): number {
  const fromMs = from.getTime();
  const toMs = to.getTime();
  if (fromMs >= toMs) return 0;

  let count = 0;

  const startDay = new Date(from);
  startDay.setHours(0, 0, 0, 0);

  const endDay = new Date(to);
  endDay.setHours(0, 0, 0, 0);

  const cursor = new Date(startDay);
  while (cursor.getTime() <= endDay.getTime()) {
    for (const time of scheduleTimes) {
      const { hours, minutes } = parseTime(time);
      const eventTime = new Date(cursor);
      eventTime.setHours(hours, minutes, 0, 0);

      const eventMs = eventTime.getTime();
      if (eventMs > fromMs && eventMs <= toMs) {
        count++;
      }
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return count;
}

export function findNextScheduledTime(
  scheduleTimes: string[],
  now: Date,
): Date {
  const sorted = [...scheduleTimes].sort();
  const nowMs = now.getTime();

  for (const time of sorted) {
    const { hours, minutes } = parseTime(time);
    const candidate = new Date(now);
    candidate.setHours(hours, minutes, 0, 0);

    if (candidate.getTime() > nowMs) {
      return candidate;
    }
  }

  const { hours, minutes } = parseTime(sorted[0]);
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(hours, minutes, 0, 0);
  return tomorrow;
}
