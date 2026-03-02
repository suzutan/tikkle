import type { Timer } from '../domain/timer/types';
import { TIMER_TYPE_LABELS } from '../lib/timer-type-labels';
import { isoToDatetimeLocal } from '../lib/timezone';

const TIMER_TYPES = Object.keys(TIMER_TYPE_LABELS) as Array<keyof typeof TIMER_TYPE_LABELS>;

export function TimerForm({ timer, errors }: { timer?: Timer; errors?: string[] }) {
  const isEdit = !!timer;
  const action = isEdit ? `/api/timers/${timer!.id}` : '/api/timers';
  const method = isEdit ? 'put' : 'post';

  return (
    <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h2 class="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
        {isEdit ? 'タイマー編集' : 'タイマー作成'}
      </h2>

      {errors && errors.length > 0 && (
        <div class="mb-4 rounded bg-red-50 p-3 dark:bg-red-900/30">
          {errors.map((error) => (
            <p class="text-sm text-red-600 dark:text-red-400">{error}</p>
          ))}
        </div>
      )}

      <form
        x-data={`timerForm(${JSON.stringify({
          type: timer?.type ?? 'countdown',
          isEdit,
        })})`}
        method="post"
        action={action}
      >
        {isEdit && <input type="hidden" name="_method" value={method} />}

        {!isEdit && (
          <div class="mb-4">
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">種別</label>
            <select
              name="type"
              x-model="type"
              x-on:change="onTypeChange()"
              class="w-full rounded border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            >
              {TIMER_TYPES.map((type) => (
                <option value={type}>{TIMER_TYPE_LABELS[type]}</option>
              ))}
            </select>
          </div>
        )}

        <div class="mb-4">
          <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">名前</label>
          <input
            type="text"
            name="name"
            value={timer?.name ?? ''}
            required
            class="w-full rounded border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          />
        </div>

        {/* countdown / countdown-elapsed */}
        <div x-show="type === 'countdown' || type === 'countdown-elapsed'" class="mb-4">
          <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">目標日時</label>
          <input
            type="datetime-local"
            name="targetDate"
            value={timer && ('targetDate' in timer) ? isoToDatetimeLocal(timer.targetDate) : ''}
            class="w-full rounded border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          />
        </div>

        {/* elapsed */}
        <div x-show="type === 'elapsed'" class="mb-4">
          <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">開始日時</label>
          <input
            type="datetime-local"
            name="startDate"
            value={timer && ('startDate' in timer) ? isoToDatetimeLocal(timer.startDate) : ''}
            class="w-full rounded border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          />
        </div>

        {/* stamina / periodic-increment shared fields */}
        <div x-show="type === 'stamina' || type === 'periodic-increment'">
          <div class="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">現在値</label>
              <input
                type="number"
                name="currentValue"
                value={timer && ('currentValue' in timer) ? String(timer.currentValue) : '0'}
                min="0"
                class="w-full rounded border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">最大値</label>
              <input
                type="number"
                name="maxValue"
                value={timer && ('maxValue' in timer) ? String(timer.maxValue) : '100'}
                min="1"
                class="w-full rounded border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>
          </div>
        </div>

        {/* stamina specific */}
        <div x-show="type === 'stamina'">
          <div class="mb-4">
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">回復間隔</label>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="mb-1 block text-xs text-gray-600 dark:text-gray-400">分</label>
                <input
                  type="number"
                  name="recoveryIntervalMinutes"
                  value={timer && ('recoveryIntervalSeconds' in timer) && timer.recoveryIntervalSeconds ? String(Math.floor(timer.recoveryIntervalSeconds / 60)) : (timer && ('recoveryIntervalMinutes' in timer) ? String(Math.floor(timer.recoveryIntervalMinutes)) : '5')}
                  min="0"
                  class="w-full rounded border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
              <div>
                <label class="mb-1 block text-xs text-gray-600 dark:text-gray-400">秒</label>
                <input
                  type="number"
                  name="recoveryIntervalSeconds"
                  value={timer && ('recoveryIntervalSeconds' in timer) && timer.recoveryIntervalSeconds ? String(Math.floor(timer.recoveryIntervalSeconds % 60)) : '0'}
                  min="0"
                  max="59"
                  class="w-full rounded border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
            </div>
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">例: 7分12秒の場合は、分=7、秒=12と入力</p>
          </div>
        </div>

        {/* periodic-increment specific */}
        <div x-show="type === 'periodic-increment'">
          <div class="mb-4">
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">増加量</label>
            <input
              type="number"
              name="incrementAmount"
              value={timer && ('incrementAmount' in timer) ? String(timer.incrementAmount) : '1'}
              min="1"
              class="w-full rounded border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            />
          </div>
          <div class="mb-4">
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">スケジュール時刻（カンマ区切り、例: 06:00,12:00,18:00）</label>
            <input
              type="text"
              name="scheduleTimes"
              value={timer && ('scheduleTimes' in timer) ? timer.scheduleTimes.join(',') : '06:00,12:00,18:00'}
              class="w-full rounded border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            />
          </div>
        </div>

        <div class="flex justify-end gap-3">
          <a href="/" class="rounded border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
            キャンセル
          </a>
          <button type="submit" class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
            {isEdit ? '更新' : '作成'}
          </button>
        </div>
      </form>
    </div>
  );
}
