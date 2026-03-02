import { Hono } from 'hono';
import { renderer } from './renderer';
import { D1TimerRepository } from './repository/timer';
import { createTimerSchema } from './domain/timer/validation';
import { TimerCard, TimerCardEmpty } from './views/timer-card';
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
    <div>
      <div class="mb-6 flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900">タイマー一覧</h1>
        <a
          href="/timers/new"
          class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          新規作成
        </a>
      </div>
      <div class="space-y-4" id="timer-list">
        {timers.length === 0
          ? <TimerCardEmpty />
          : timers.map((timer) => <TimerCard timer={timer} />)}
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
      <div class="rounded-lg border border-dashed p-12 text-center text-gray-500">
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
      return { name, type, targetDate: new Date(body.targetDate).toISOString() };
    case 'elapsed':
      return { name, type, startDate: new Date(body.startDate).toISOString() };
    case 'countdown-elapsed':
      return { name, type, targetDate: new Date(body.targetDate).toISOString() };
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
