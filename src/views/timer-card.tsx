import type { Timer } from '../domain/timer/types';
import { TIMER_TYPE_LABELS } from '../lib/timer-type-labels';

export function TimerCard({ timer }: { timer: Timer }) {
  const timerJson = JSON.stringify(timer).replace(/</g, '\\u003c');

  return (
    <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800" x-data="{ showDeleteModal: false }">
      <div class="flex items-start justify-between">
        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">{timer.name}</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">{TIMER_TYPE_LABELS[timer.type]}</p>
        </div>
        <div class="flex gap-2">
          <a
            href={`/timers/${timer.id}/edit`}
            class="rounded bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            編集
          </a>
          <button
            x-on:click="showDeleteModal = true"
            class="rounded bg-red-50 px-3 py-1 text-sm text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
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
          x-bind:class="expired ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'"
          x-text="display"
        ></p>
        <div x-show="percentage >= 0" class="mt-2">
          <div class="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              class="h-2 rounded-full bg-blue-500 dark:bg-blue-400 transition-all"
              x-bind:style="`width: ${percentage}%`"
            ></div>
          </div>
        </div>
        <p x-show="subtext" x-text="subtext" class="mt-1 text-sm text-gray-500 dark:text-gray-400"></p>
        <p x-show="targetTime" x-text="targetTime" class="mt-1 text-xs text-gray-400 dark:text-gray-500"></p>
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
