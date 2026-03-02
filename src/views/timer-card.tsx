import type { Timer } from '../domain/timer/types';
import { TIMER_TYPE_LABELS } from '../lib/timer-type-labels';

export function TimerCard({ timer }: { timer: Timer }) {
  const timerJson = JSON.stringify(timer).replace(/</g, '\\u003c');

  return (
    <div class="rounded-lg border bg-white p-4 shadow-sm">
      <div class="flex items-start justify-between">
        <div>
          <h3 class="text-lg font-semibold text-gray-900">{timer.name}</h3>
          <p class="text-sm text-gray-500">{TIMER_TYPE_LABELS[timer.type]}</p>
        </div>
        <div class="flex gap-2">
          <a
            href={`/timers/${timer.id}/edit`}
            class="rounded bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200"
          >
            編集
          </a>
          <button
            hx-delete={`/api/timers/${timer.id}`}
            hx-confirm="このタイマーを削除しますか？"
            hx-target="closest div.rounded-lg"
            hx-swap="outerHTML"
            class="rounded bg-red-50 px-3 py-1 text-sm text-red-600 hover:bg-red-100"
          >
            削除
          </button>
        </div>
      </div>
      <div
        class="mt-3"
        x-data={`timerDisplay('${timerJson}')`}
      >
        <p
          class="text-2xl font-mono"
          x-bind:class="expired ? 'text-red-600' : 'text-gray-900'"
          x-text="display"
        ></p>
        <div x-show="percentage >= 0" class="mt-2">
          <div class="h-2 w-full rounded-full bg-gray-200">
            <div
              class="h-2 rounded-full bg-blue-500 transition-all"
              x-bind:style="`width: ${percentage}%`"
            ></div>
          </div>
        </div>
        <p x-show="subtext" x-text="subtext" class="mt-1 text-sm text-gray-500"></p>
      </div>
    </div>
  );
}

export function TimerCardEmpty() {
  return (
    <div class="rounded-lg border border-dashed p-12 text-center text-gray-500">
      タイマーがありません。最初のタイマーを作成しましょう。
    </div>
  );
}
