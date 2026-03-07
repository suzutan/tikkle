import type { Timer } from '../domain/timer/types';
import { TIMER_TYPE_LABELS } from '../lib/timer-type-labels';

export function TimerCard({ timer, archived }: { timer: Timer; archived?: boolean }) {
  const timerJson = JSON.stringify(timer).replace(/</g, '\\u003c');

  return (
    <div class={`group flex h-full flex-col rounded-2xl border p-6 shadow-lg transition-all hover:shadow-xl ${archived ? 'border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 opacity-75 dark:border-gray-600 dark:from-gray-850 dark:to-gray-900' : 'border-gray-200 bg-gradient-to-br from-white to-gray-50 dark:border-gray-700 dark:from-gray-800 dark:to-gray-900'}`} x-data="{ showDeleteModal: false }">
      <div class="mb-4 flex items-start justify-between">
        <div class="flex-1">
          <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100">{timer.name}</h3>
          <p class="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">{TIMER_TYPE_LABELS[timer.type]}</p>
          {timer.tags && timer.tags.length > 0 && (
            <div class="mt-2 flex flex-wrap gap-1.5">
              {timer.tags.map((tag) => (
                <span class="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div class="flex gap-1.5">
          {archived ? (
            <button
              hx-post={`/api/timers/${timer.id}/unarchive`}
              hx-swap="none"
              {...{ 'hx-on::after-request': 'window.location.reload()' }}
              class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-green-50 hover:text-green-600 dark:text-gray-500 dark:hover:bg-green-900/30 dark:hover:text-green-400"
              title="復元"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-4 w-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
              </svg>
            </button>
          ) : (
            <>
              <a
                href={`/timers/${timer.id}/edit`}
                class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                title="編集"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-4 w-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
              </a>
              <button
                hx-post={`/api/timers/${timer.id}/duplicate`}
                hx-swap="none"
                {...{ 'hx-on::after-request': 'window.location.reload()' }}
                class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:text-gray-500 dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
                title="複製"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-4 w-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                </svg>
              </button>
              <button
                hx-post={`/api/timers/${timer.id}/archive`}
                hx-swap="none"
                {...{ 'hx-on::after-request': 'window.location.reload()' }}
                class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-yellow-50 hover:text-yellow-600 dark:text-gray-500 dark:hover:bg-yellow-900/30 dark:hover:text-yellow-400"
                title="アーカイブ"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-4 w-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
              </button>
            </>
          )}
          <button
            x-on:click="showDeleteModal = true"
            class="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:text-gray-500 dark:hover:bg-red-900/30 dark:hover:text-red-400"
            title="削除"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-4 w-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        </div>
      </div>
      <div class="flex flex-1 flex-col" x-data={`timerDisplay('${timerJson}')`}>
        <div class="space-y-2">
          <p
            class="font-timer text-3xl font-bold tabular-nums leading-none"
            x-bind:class="expired ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'"
            x-text="display"
          ></p>
          <p x-show="subtext" x-text="subtext" class="font-timer text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"></p>
          <p x-show="targetTime" x-text="targetTime" class="whitespace-pre-line text-xs text-gray-400 dark:text-gray-500"></p>
        </div>
        {/* Bottom section - pushed to bottom for consistent alignment */}
        <div class="mt-auto">
          {/* Progress bar */}
          <div x-show="percentage >= 0" class="pt-3">
            <div class="mb-1 flex items-center justify-end">
              <span
                class="font-timer text-xs font-semibold"
                x-text="`${Math.round(percentage)}%`"
                x-bind:class="expired ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'"
              ></span>
            </div>
            <div class="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                class="h-2 rounded-full transition-all duration-1000 ease-linear"
                x-bind:class="expired ? 'bg-red-500 dark:bg-red-400' : percentage > 80 ? 'bg-green-500 dark:bg-green-400' : percentage > 50 ? 'bg-blue-500 dark:bg-blue-400' : percentage > 20 ? 'bg-yellow-500 dark:bg-yellow-400' : 'bg-orange-500 dark:bg-orange-400'"
                x-bind:style="`width: ${Math.min(100, percentage)}%`"
              ></div>
            </div>
          </div>
          {/* Quick actions or spacer for consistent card height */}
          {(timer.type === 'stamina' || timer.type === 'periodic-increment') && !archived ? (
            <div class="flex items-center gap-1.5 border-t border-gray-100 pt-3 mt-3 dark:border-gray-700">
              <span class="text-xs text-gray-400 dark:text-gray-500 mr-1">値調整:</span>
              <button
                hx-post={`/api/timers/${timer.id}/quick-action`}
                hx-vals='{"action":"adjust-value","delta":"-1"}'
                hx-swap="none"
                {...{ 'hx-on::after-request': 'window.location.reload()' }}
                class="rounded px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                title="-1"
              >-1</button>
              <button
                hx-post={`/api/timers/${timer.id}/quick-action`}
                hx-vals='{"action":"adjust-value","delta":"1"}'
                hx-swap="none"
                {...{ 'hx-on::after-request': 'window.location.reload()' }}
                class="rounded px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                title="+1"
              >+1</button>
              <button
                hx-post={`/api/timers/${timer.id}/quick-action`}
                hx-vals='{"action":"adjust-value","delta":"10"}'
                hx-swap="none"
                {...{ 'hx-on::after-request': 'window.location.reload()' }}
                class="rounded px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                title="+10"
              >+10</button>
              <div class="flex-1"></div>
              <button
                hx-post={`/api/timers/${timer.id}/quick-action`}
                hx-vals='{"action":"reset-value"}'
                hx-swap="none"
                {...{ 'hx-on::after-request': 'window.location.reload()' }}
                class="rounded px-2 py-1 text-xs font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 dark:text-orange-400 dark:bg-orange-900/20 dark:hover:bg-orange-900/40"
                title="0にリセット"
              >0</button>
              <button
                hx-post={`/api/timers/${timer.id}/quick-action`}
                hx-vals='{"action":"max-value"}'
                hx-swap="none"
                {...{ 'hx-on::after-request': 'window.location.reload()' }}
                class="rounded px-2 py-1 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 dark:text-green-400 dark:bg-green-900/20 dark:hover:bg-green-900/40"
                title="最大値にする"
              >MAX</button>
            </div>
          ) : (
            <div class="h-10"></div>
          )}
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
              hx-target="closest [data-timer-card]"
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

export function TimerListItem({ timer, archived }: { timer: Timer; archived?: boolean }) {
  const timerJson = JSON.stringify(timer).replace(/</g, '\\u003c');

  return (
    <div class={`group rounded-xl border bg-white px-4 py-3 shadow-sm transition-all hover:shadow-md dark:bg-gray-800 ${archived ? 'border-gray-300 opacity-75 dark:border-gray-600' : 'border-gray-200 dark:border-gray-700'}`} x-data="{ showDeleteModal: false }">
      <div class="flex items-center gap-4">
      {/* Timer info */}
      <div class="flex-1 min-w-0" x-data={`timerDisplay('${timerJson}')`}>
        <div class="flex items-baseline gap-2 flex-wrap">
          <h3 class="truncate font-semibold text-gray-900 dark:text-gray-100">{timer.name}</h3>
          <span class="text-xs text-gray-500 dark:text-gray-400">{TIMER_TYPE_LABELS[timer.type]}</span>
          {timer.tags && timer.tags.length > 0 && timer.tags.map((tag) => (
            <span class="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
              {tag}
            </span>
          ))}
        </div>
        <div class="mt-0.5 flex items-baseline gap-2">
          <p
            class="font-timer text-lg font-bold tabular-nums"
            x-bind:class="expired ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'"
            x-text="display"
          ></p>
          <span
            x-show="percentage >= 0"
            class="font-timer text-xs font-semibold"
            x-text="`${Math.round(percentage)}%`"
            x-bind:class="expired ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'"
          ></span>
          <p x-show="targetTime" x-text="targetTime" class="whitespace-pre-line text-xs text-gray-400 dark:text-gray-500"></p>
        </div>
        {/* Progress bar */}
        <div x-show="percentage >= 0" class="mt-1.5">
          <div class="h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              class="h-1.5 rounded-full transition-all duration-1000 ease-linear"
              x-bind:class="expired ? 'bg-red-500 dark:bg-red-400' : percentage > 80 ? 'bg-green-500 dark:bg-green-400' : percentage > 50 ? 'bg-blue-500 dark:bg-blue-400' : percentage > 20 ? 'bg-yellow-500 dark:bg-yellow-400' : 'bg-orange-500 dark:bg-orange-400'"
              x-bind:style="`width: ${Math.min(100, percentage)}%`"
            ></div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      {(timer.type === 'stamina' || timer.type === 'periodic-increment') && !archived && (
        <div class="flex items-center gap-1">
          <button
            hx-post={`/api/timers/${timer.id}/quick-action`}
            hx-vals='{"action":"adjust-value","delta":"-1"}'
            hx-swap="none"
            {...{ 'hx-on::after-request': 'window.location.reload()' }}
            class="rounded px-1.5 py-0.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
          >-1</button>
          <button
            hx-post={`/api/timers/${timer.id}/quick-action`}
            hx-vals='{"action":"adjust-value","delta":"1"}'
            hx-swap="none"
            {...{ 'hx-on::after-request': 'window.location.reload()' }}
            class="rounded px-1.5 py-0.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
          >+1</button>
          <button
            hx-post={`/api/timers/${timer.id}/quick-action`}
            hx-vals='{"action":"adjust-value","delta":"10"}'
            hx-swap="none"
            {...{ 'hx-on::after-request': 'window.location.reload()' }}
            class="rounded px-1.5 py-0.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
          >+10</button>
        </div>
      )}

      {/* Actions */}
      <div class="flex gap-1">
        {archived ? (
          <button
            hx-post={`/api/timers/${timer.id}/unarchive`}
            hx-swap="none"
            {...{ 'hx-on::after-request': 'window.location.reload()' }}
            class="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-green-50 hover:text-green-600 dark:text-gray-500 dark:hover:bg-green-900/30 dark:hover:text-green-400"
            title="復元"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-4 w-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
            </svg>
          </button>
        ) : (
          <>
            <a
              href={`/timers/${timer.id}/edit`}
              class="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              title="編集"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-4 w-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
            </a>
            <button
              hx-post={`/api/timers/${timer.id}/duplicate`}
              hx-swap="none"
              {...{ 'hx-on::after-request': 'window.location.reload()' }}
              class="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:text-gray-500 dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
              title="複製"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-4 w-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
              </svg>
            </button>
            <button
              hx-post={`/api/timers/${timer.id}/archive`}
              hx-swap="none"
              {...{ 'hx-on::after-request': 'window.location.reload()' }}
              class="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-yellow-50 hover:text-yellow-600 dark:text-gray-500 dark:hover:bg-yellow-900/30 dark:hover:text-yellow-400"
              title="アーカイブ"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-4 w-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
              </svg>
            </button>
          </>
        )}
        <button
          x-on:click="showDeleteModal = true"
          class="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:text-gray-500 dark:hover:bg-red-900/30 dark:hover:text-red-400"
          title="削除"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-4 w-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </button>
      </div>
      </div>

      {/* Delete modal */}
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
              hx-target="closest [data-timer-card]"
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
