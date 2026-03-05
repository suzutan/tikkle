import { Hono } from 'hono';
import { renderer } from './renderer';
import { D1TimerRepository } from './repository/timer';
import { createTimerSchema } from './domain/timer/validation';
import { datetimeLocalToISO } from './lib/timezone';
import { TimerCard, TimerCardEmpty, TimerListItem } from './views/timer-card';
import { TimerForm } from './views/timer-form';
import { TIMER_TYPE_LABELS } from './lib/timer-type-labels';
import type { CreateTimerInput } from './domain/timer/types';

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use(renderer);

// --- Pages ---

app.get('/', async (c) => {
  const repo = new D1TimerRepository(c.env.DB);
  const timers = await repo.getAll();

  // Extract all unique tags from timers
  const allTags = Array.from(new Set(timers.flatMap(t => t.tags || [])));

  return c.render(
    <div
      x-data="{ viewMode: localStorage.getItem('viewMode') || 'card', filterType: readFilterFromUrl('type'), filterTags: readFilterFromUrl('tags'), typeSearch: '', tagSearch: '' }"
      x-init="$watch('filterType', v => syncFilterToUrl('type', v)); $watch('filterTags', v => syncFilterToUrl('tags', v))"
    >
      <div class="mb-6">
        <div class="flex items-center justify-between mb-4">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">タイマー一覧</h1>
          <div class="flex gap-2">
          {/* View toggle */}
          <div class="flex rounded-lg border border-gray-300 dark:border-gray-600">
            <button
              x-on:click="viewMode = 'card'; localStorage.setItem('viewMode', 'card')"
              x-bind:class="viewMode === 'card' ? 'bg-blue-600 text-white dark:bg-blue-500' : 'bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-300'"
              class="rounded-l-lg px-3 py-2 transition-colors"
              title="カードビュー"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-5 w-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
            </button>
            <button
              x-on:click="viewMode = 'list'; localStorage.setItem('viewMode', 'list')"
              x-bind:class="viewMode === 'list' ? 'bg-blue-600 text-white dark:bg-blue-500' : 'bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-300'"
              class="rounded-r-lg px-3 py-2 transition-colors"
              title="リストビュー"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-5 w-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
              </svg>
            </button>
          </div>

          <a
            href="/timers/new"
            class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            新規作成
          </a>
          </div>
        </div>

        {/* Filters */}
        <div class="flex flex-wrap gap-3 rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
          <div class="flex-1 min-w-[200px]" x-data="{ typeOpen: false }" {...{ 'x-on:click.outside': 'typeOpen = false' }}>
            <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">種別でフィルター</label>
            <div class="relative">
              <button
                type="button"
                x-on:click="typeOpen = !typeOpen"
                class="flex w-full items-center justify-between rounded border border-gray-300 bg-white px-3 py-2 text-left text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              >
                <span x-text={`filterType.length === 0 ? 'すべて' : filterType.map(t => (${JSON.stringify(TIMER_TYPE_LABELS)})[t] || t).join(', ')`}></span>
                <svg class="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              <div x-show="typeOpen" x-cloak class="absolute z-20 mt-1 w-full rounded border border-gray-300 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-700">
                <div class="p-2">
                  <input
                    type="text"
                    x-model="typeSearch"
                    placeholder="種別を検索..."
                    class="w-full rounded border border-gray-200 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                  />
                </div>
                <div class="max-h-48 overflow-y-auto px-2 pb-2">
                  {Object.entries(TIMER_TYPE_LABELS).map(([value, label]) => (
                    <label
                      x-show={`'${label}'.includes(typeSearch) || '${value}'.includes(typeSearch) || typeSearch === ''`}
                      class="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-600"
                    >
                      <input type="checkbox" x-model="filterType" value={value} class="rounded" />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {allTags.length > 0 && (
            <div class="flex-1 min-w-[200px]">
              <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">タグでフィルター</label>
              <input
                type="text"
                x-model="tagSearch"
                placeholder="タグ検索..."
                class="mb-2 w-full rounded border border-gray-200 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              />
              <div class="flex flex-wrap gap-1.5">
                {allTags.map((tag) => (
                  <button
                    type="button"
                    x-show={`'${tag}'.toLowerCase().includes(tagSearch.toLowerCase()) || tagSearch === ''`}
                    x-on:click={`filterTags.includes('${tag}') ? filterTags = filterTags.filter(t => t !== '${tag}') : filterTags.push('${tag}')`}
                    x-bind:class={`filterTags.includes('${tag}') ? 'bg-blue-600 text-white dark:bg-blue-500' : 'bg-white text-gray-700 dark:bg-gray-700 dark:text-gray-300'`}
                    class="rounded-full px-3 py-1 text-xs font-medium transition-colors border border-gray-300 dark:border-gray-600"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div class="flex items-end">
            <button
              type="button"
              x-on:click="filterType = []; filterTags = []; typeSearch = ''; tagSearch = ''"
              class="rounded bg-gray-600 px-4 py-2 text-sm text-white hover:bg-gray-700 dark:bg-gray-600 dark:hover:bg-gray-500"
            >
              フィルターをクリア
            </button>
          </div>
        </div>
      </div>

      {/* Card view */}
      <div x-show="viewMode === 'card'" class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3" id="timer-list">
        {timers.length === 0 && <TimerCardEmpty />}
        {timers.map((timer) => {
          const timerJson = JSON.stringify(timer).replace(/</g, '\\u003c').replace(/'/g, "\\'");
          const timerType = timer.type;
          const timerTags = JSON.stringify(timer.tags || []).replace(/</g, '\\u003c');
          return (
            <div
              x-show={`(() => {
                const timer = ${timerJson};
                if (filterType.length > 0 && !filterType.includes(timer.type)) return false;
                if (filterTags.length > 0 && (!timer.tags || !filterTags.some(tag => timer.tags.includes(tag)))) return false;
                return true;
              })()`}
              x-data="{ timer: ${timerJson} }"
            >
              <TimerCard timer={timer} />
            </div>
          );
        })}
      </div>

      {/* List view */}
      <div x-show="viewMode === 'list'" class="space-y-2" id="timer-list-compact">
        {timers.length === 0 && <TimerCardEmpty />}
        {timers.map((timer) => {
          const timerJson = JSON.stringify(timer).replace(/</g, '\\u003c').replace(/'/g, "\\'");
          return (
            <div
              x-show={`(() => {
                const timer = ${timerJson};
                if (filterType.length > 0 && !filterType.includes(timer.type)) return false;
                if (filterTags.length > 0 && (!timer.tags || !filterTags.some(tag => timer.tags.includes(tag)))) return false;
                return true;
              })()`}
            >
              <TimerListItem timer={timer} />
            </div>
          );
        })}
      </div>
    </div>,
  );
});

app.get('/timers/new', (c) => {
  return c.render(<TimerForm />, { title: '新規作成' });
});

app.get('/timers/:id/edit', async (c) => {
  const repo = new D1TimerRepository(c.env.DB);
  const timer = await repo.getById(c.req.param('id'));
  if (!timer) {
    return c.render(
      <div class="rounded-lg border border-dashed border-gray-300 p-12 text-center text-gray-500 dark:border-gray-700 dark:text-gray-400">
        タイマーが見つかりません
      </div>,
    );
  }
  return c.render(<TimerForm timer={timer} />, { title: '編集' });
});

// --- API ---

function parseFormToInput(body: Record<string, string>): CreateTimerInput {
  const type = body.type;
  const name = body.name;
  // Parse tags: split by comma, trim, and filter out empty strings
  const tags = body.tags
    ? body.tags.split(',').map(t => t.trim()).filter(t => t.length > 0)
    : undefined;

  switch (type) {
    case 'countdown':
      return { name, type, targetDate: datetimeLocalToISO(body.targetDate), tags };
    case 'elapsed':
      return { name, type, startDate: datetimeLocalToISO(body.startDate), tags };
    case 'countdown-elapsed':
      return { name, type, targetDate: datetimeLocalToISO(body.targetDate), tags };
    case 'stamina': {
      // Calculate total seconds from minutes and seconds inputs
      const minutes = Number(body.recoveryIntervalMinutes) || 0;
      const seconds = Number(body.recoveryIntervalSeconds) || 0;
      const totalSeconds = minutes * 60 + seconds;
      return {
        name,
        type,
        currentValue: Number(body.currentValue),
        maxValue: Number(body.maxValue),
        recoveryIntervalMinutes: minutes, // Keep for backwards compatibility
        recoveryIntervalSeconds: totalSeconds,
        lastUpdatedAt: new Date().toISOString(),
        tags,
      };
    }
    case 'periodic-increment':
      return {
        name,
        type,
        currentValue: Number(body.currentValue),
        maxValue: Number(body.maxValue),
        incrementAmount: Number(body.incrementAmount),
        scheduleTimes: body.scheduleTimes.split(',').map((s) => s.trim()),
        lastUpdatedAt: new Date().toISOString(),
        tags,
      };
    default:
      throw new Error(`Unknown type: ${type}`);
  }
}

app.post('/api/timers', async (c) => {
  const repo = new D1TimerRepository(c.env.DB);
  const body = await c.req.parseBody() as Record<string, string>;

  let input: CreateTimerInput;
  try {
    input = parseFormToInput(body);
  } catch {
    return c.render(<TimerForm errors={['入力内容が不正です']} />, { title: '新規作成' });
  }

  const result = createTimerSchema.safeParse(input);
  if (!result.success) {
    const errors = result.error.issues.map((i) => i.message);
    return c.render(<TimerForm errors={errors} />, { title: '新規作成' });
  }

  await repo.create(input);
  return c.redirect('/');
});

app.post('/api/timers/:id', async (c) => {
  const repo = new D1TimerRepository(c.env.DB);
  const body = await c.req.parseBody() as Record<string, string>;

  if (body._method !== 'put') return c.notFound();

  const timer = await repo.getById(c.req.param('id'));
  if (!timer) return c.notFound();

  let input: CreateTimerInput;
  try {
    input = parseFormToInput({ ...body, type: timer.type });
  } catch {
    return c.render(<TimerForm timer={timer} errors={['入力内容が不正です']} />, { title: '編集' });
  }

  const result = createTimerSchema.safeParse(input);
  if (!result.success) {
    const errors = result.error.issues.map((i) => i.message);
    return c.render(<TimerForm timer={timer} errors={errors} />, { title: '編集' });
  }

  await repo.update(timer.id, input);
  return c.redirect('/');
});

app.delete('/api/timers/:id', async (c) => {
  const repo = new D1TimerRepository(c.env.DB);
  try {
    await repo.delete(c.req.param('id'));
  } catch {
    // already deleted
  }
  return c.body(null, 200);
});

export default app;
