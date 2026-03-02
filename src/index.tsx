import { Hono } from 'hono';
import { renderer } from './renderer';
import { D1TimerRepository } from './repository/timer';
import { createTimerSchema } from './domain/timer/validation';
import { datetimeLocalToISO } from './lib/timezone';
import { TimerCard, TimerCardEmpty, TimerListItem } from './views/timer-card';
import { TimerForm } from './views/timer-form';
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

  return c.render(
    <div x-data="{ viewMode: localStorage.getItem('viewMode') || 'card' }">
      <div class="mb-6 flex items-center justify-between">
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

      {/* Card view */}
      <div x-show="viewMode === 'card'" class="space-y-4" id="timer-list">
        {timers.length === 0
          ? <TimerCardEmpty />
          : timers.map((timer) => <TimerCard timer={timer} />)}
      </div>

      {/* List view */}
      <div x-show="viewMode === 'list'" class="space-y-2" id="timer-list-compact">
        {timers.length === 0
          ? <TimerCardEmpty />
          : timers.map((timer) => <TimerListItem timer={timer} />)}
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

  switch (type) {
    case 'countdown':
      return { name, type, targetDate: datetimeLocalToISO(body.targetDate) };
    case 'elapsed':
      return { name, type, startDate: datetimeLocalToISO(body.startDate) };
    case 'countdown-elapsed':
      return { name, type, targetDate: datetimeLocalToISO(body.targetDate) };
    case 'stamina':
      return {
        name,
        type,
        currentValue: Number(body.currentValue),
        maxValue: Number(body.maxValue),
        recoveryIntervalMinutes: Number(body.recoveryIntervalMinutes),
        lastUpdatedAt: new Date().toISOString(),
      };
    case 'periodic-increment':
      return {
        name,
        type,
        currentValue: Number(body.currentValue),
        maxValue: Number(body.maxValue),
        incrementAmount: Number(body.incrementAmount),
        scheduleTimes: body.scheduleTimes.split(',').map((s) => s.trim()),
        lastUpdatedAt: new Date().toISOString(),
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
