const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = 60 * MS_PER_SECOND;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const MS_PER_DAY = 24 * MS_PER_HOUR;

interface DurationParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function decompose(ms: number): DurationParts {
  let remaining = Math.floor(ms / MS_PER_SECOND) * MS_PER_SECOND;

  const days = Math.floor(remaining / MS_PER_DAY);
  remaining -= days * MS_PER_DAY;

  const hours = Math.floor(remaining / MS_PER_HOUR);
  remaining -= hours * MS_PER_HOUR;

  const minutes = Math.floor(remaining / MS_PER_MINUTE);
  remaining -= minutes * MS_PER_MINUTE;

  const seconds = Math.floor(remaining / MS_PER_SECOND);

  return { days, hours, minutes, seconds };
}

interface DurationLabels {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
}

const LABELS_FULL: DurationLabels = {
  days: '日',
  hours: '時間',
  minutes: '分',
  seconds: '秒',
};

const LABELS_COMPACT: DurationLabels = {
  days: 'd',
  hours: 'h',
  minutes: 'm',
  seconds: 's',
};

function formatDurationWith(ms: number, labels: DurationLabels): string {
  const { days, hours, minutes, seconds } = decompose(ms);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}${labels.days}`);
  if (hours > 0) parts.push(`${hours}${labels.hours}`);
  if (minutes > 0) parts.push(`${minutes}${labels.minutes}`);
  if (seconds > 0) parts.push(`${seconds}${labels.seconds}`);

  if (parts.length === 0) return `0${labels.seconds}`;
  return parts.join(' ');
}

export function formatDuration(ms: number): string {
  return formatDurationWith(ms, LABELS_FULL);
}

export function formatDurationCompact(ms: number): string {
  return formatDurationWith(ms, LABELS_COMPACT);
}

export function formatFraction(current: number, max: number): string {
  return `${current} / ${max}`;
}

/**
 * ISO日時文字列をローカル時間でフォーマット（例: "2026-03-03 15:30"）
 */
export function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

/**
 * ISO日時文字列を時刻のみでフォーマット（例: "15:30"）
 */
export function formatTime(isoString: string): string {
  const date = new Date(isoString);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}
