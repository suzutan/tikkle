import type { Timer } from '../domain/timer/types';
import { TIMER_TYPE_LABELS } from '../lib/timer-type-labels';

export function TimerCard({ timer }: { timer: Timer }) {
  const timerJson = JSON.stringify(timer).replace(/</g, '\\u003c');

  return (
    <div class="group rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg transition-all hover:shadow-xl dark:border-gray-700 dark:from-gray-800 dark:to-gray-900" x-data="{ showDeleteModal: false }">
      <div class="mb-4 flex items-start justify-between">
        <div class="flex-1">
          <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100">{timer.name}</h3>
          <p class="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">{TIMER_TYPE_LABELS[timer.type]}</p>
        </div>
        <div class="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          <a
            href={`/timers/${timer.id}/edit`}
            class="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            編集
          </a>
          <button
            x-on:click="showDeleteModal = true"
            class="rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
          >
            削除
          </button>
        </div>
      </div>
      <div
        class="flex items-center gap-6"
        x-data={`timerDisplay('${timerJson}')`}
      >
        {/* Circular progress indicator */}
        <div class="relative flex h-32 w-32 flex-shrink-0 items-center justify-center" x-show="percentage >= 0">
          <svg class="h-full w-full -rotate-90 transform">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              stroke-width="8"
              fill="none"
              class="text-gray-200 dark:text-gray-700"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              stroke-width="8"
              fill="none"
              stroke-linecap="round"
              class="transition-all duration-1000 ease-linear"
              x-bind:class="expired ? 'text-red-500 dark:text-red-400' : percentage > 80 ? 'text-green-500 dark:text-green-400' : percentage > 50 ? 'text-blue-500 dark:text-blue-400' : percentage > 20 ? 'text-yellow-500 dark:text-yellow-400' : 'text-orange-500 dark:text-orange-400'"
              x-bind:style="`stroke-dasharray: ${2 * Math.PI * 56}; stroke-dashoffset: ${2 * Math.PI * 56 * (1 - percentage / 100)}`"
            />
          </svg>
          <div class="absolute inset-0 flex items-center justify-center">
            <span class="text-2xl font-bold" x-text="`${Math.round(percentage)}%`" x-bind:class="expired ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'"></span>
          </div>
        </div>

        {/* Timer display */}
        <div class="flex-1 space-y-2">
          <p
            class="text-3xl font-bold tabular-nums leading-none"
            x-bind:class="expired ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'"
            x-text="display"
          ></p>
          <p x-show="subtext" x-text="subtext" class="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"></p>
          <p x-show="targetTime" x-text="targetTime" class="text-xs text-gray-400 dark:text-gray-500"></p>
        </div>
      </div>

      <div
        x-show="showDeleteModal"
        x-cloak
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 dark:bg-opacity-70"
        {...{ 'x-on:click.self': 'showDeleteModal = false' }}
      >
        <div class="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">タイマーを削除</h3>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-300">
            「{timer.name}」を削除してもよろしいですか？この操作は取り消せません。
          </p>
          <div class="mt-6 flex justify-end gap-3">
            <button
              x-on:click="showDeleteModal = false"
              class="rounded bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              キャンセル
            </button>
            <button
              hx-delete={`/api/timers/${timer.id}`}
              hx-target="closest div.rounded-lg.border"
              hx-swap="outerHTML"
              x-on:click="showDeleteModal = false"
              class="rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
            >
              削除する
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TimerCardEmpty() {
  return (
    <div class="rounded-lg border border-dashed border-gray-300 p-12 text-center text-gray-500 dark:border-gray-700 dark:text-gray-400">
      タイマーがありません。最初のタイマーを作成しましょう。
    </div>
  );
}
