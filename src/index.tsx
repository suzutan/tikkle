import { Hono } from 'hono';
import { renderer } from './renderer';
import { D1TimerRepository } from './repository/timer';
import { D1ProjectRepository } from './repository/project';
import { createProjectSchema } from './domain/project/validation';
import { Sidebar } from './views/sidebar';
import { createTimerSchema } from './domain/timer/validation';
import { getUrgencyLevel } from './domain/timer/urgency';
import { applyQuickAction } from './domain/timer/quick-actions';
import { compareTimers, isValidSortMode } from './domain/timer/sort';
import type { SortMode } from './domain/timer/sort';
import { isPriorityLevel } from './domain/timer/priority';
import { datetimeLocalToISO } from './lib/timezone';
import { TimerForm } from './views/timer-form';
import { TimerListView } from './views/timer-list-view';
import { TIMER_TEMPLATES } from './lib/timer-templates';
import { buildFromTemplate, buildDuplicateInput } from './lib/timer-form-helpers';
import type { CreateTimerInput } from './domain/timer/types';

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use(renderer);

// --- Pages ---

app.get('/', async (c) => {
  const repo = new D1TimerRepository(c.env.DB);
  const projectRepo = new D1ProjectRepository(c.env.DB);
  const timers = await repo.getAll();
  const archivedTimers = await repo.getArchived();
  const allProjects = await projectRepo.getAll();
  const now = new Date();

  const sortParam = c.req.query('sort') ?? 'urgency';
  const sortMode: SortMode = isValidSortMode(sortParam) ? sortParam : 'urgency';
  const sortedTimers = [...timers].sort((a, b) => compareTimers(a, b, sortMode, now));

  const urgencyMap = Object.fromEntries(
    timers.map(t => [t.id, getUrgencyLevel(t, now)])
  );
  const allTags = Array.from(new Set(timers.flatMap(t => t.tags || [])));

  return c.render(
    <div class="flex flex-col md:flex-row gap-6">
      <Sidebar projects={allProjects} />
      <TimerListView
        title="タイマー一覧"
        timers={sortedTimers}
        archivedTimers={archivedTimers}
        sortMode={sortMode}
        allTags={allTags}
        urgencyMap={urgencyMap}
        allProjects={allProjects}
      />
    </div>,
  );
});

app.get('/projects/:id', async (c) => {
  const repo = new D1TimerRepository(c.env.DB);
  const projectRepo = new D1ProjectRepository(c.env.DB);
  const projectId = c.req.param('id');
  const project = await projectRepo.getById(projectId);
  if (!project) return c.notFound();

  const projectTimers = await repo.getByProjectId(projectId);
  const allArchivedTimers = await repo.getArchived();
  const archivedTimers = allArchivedTimers.filter(t => t.projectId === projectId);
  const allProjects = await projectRepo.getAll();
  const now = new Date();

  const sortParam = c.req.query('sort') ?? 'urgency';
  const sortMode: SortMode = isValidSortMode(sortParam) ? sortParam : 'urgency';
  const sortedTimers = [...projectTimers].sort((a, b) => compareTimers(a, b, sortMode, now));

  const urgencyMap = Object.fromEntries(
    projectTimers.map(t => [t.id, getUrgencyLevel(t, now)])
  );
  const allTags = Array.from(new Set(projectTimers.flatMap(t => t.tags || [])));

  const deleteButton = (
    <form method="post" action={`/api/projects/${project.id}`}>
      <input type="hidden" name="_method" value="delete" />
      <button type="submit" class="rounded-lg border border-red-300 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20" {...{ 'onclick': "return confirm('このプロジェクトを削除してもよろしいですか？タイマーは未分類に移動されます。')" }}>
        削除
      </button>
    </form>
  );

  return c.render(
    <div class="flex flex-col md:flex-row gap-6">
      <Sidebar projects={allProjects} currentProjectId={projectId} />
      <TimerListView
        title={project.name}
        timers={sortedTimers}
        archivedTimers={archivedTimers}
        sortMode={sortMode}
        allTags={allTags}
        urgencyMap={urgencyMap}
        allProjects={allProjects}
        currentProjectId={projectId}
        headerExtra={deleteButton}
      />
    </div>,
    { title: project.name },
  );
});

app.get('/timers/new', async (c) => {
  const repo = new D1TimerRepository(c.env.DB);
  const timers = await repo.getAll({ includeArchived: true });
  const allTags = Array.from(new Set(timers.flatMap(t => t.tags || [])));
  const projectRepo = new D1ProjectRepository(c.env.DB);
  const allProjects = await projectRepo.getAll();
  const preSelectedProjectId = c.req.query('projectId');
  return c.render(<TimerForm allTags={allTags} allProjects={allProjects} preSelectedProjectId={preSelectedProjectId} />, { title: '新規作成' });
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
  const timers = await repo.getAll({ includeArchived: true });
  const allTags = Array.from(new Set(timers.flatMap(t => t.tags || [])));
  const projectRepo = new D1ProjectRepository(c.env.DB);
  const allProjects = await projectRepo.getAll();
  return c.render(<TimerForm timer={timer} allTags={allTags} allProjects={allProjects} />, { title: '編集' });
});

// --- API ---

function parseFormToInput(body: Record<string, string>): CreateTimerInput {
  const type = body.type;
  const name = body.name;
  // Parse tags: split by comma, trim, and filter out empty strings
  const tags = body.tags
    ? body.tags.split(',').map(t => t.trim()).filter(t => t.length > 0)
    : undefined;
  const priority = body.priority ? Number(body.priority) : undefined;
  const projectId = body.projectId || undefined;

  switch (type) {
    case 'countdown':
      return { name, type, targetDate: datetimeLocalToISO(body.targetDate), tags, priority, projectId };
    case 'elapsed':
      return { name, type, startDate: datetimeLocalToISO(body.startDate), tags, priority, projectId };
    case 'countdown-elapsed':
      return { name, type, targetDate: datetimeLocalToISO(body.targetDate), tags, priority, projectId };
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
        priority,
        projectId,
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
        priority,
        projectId,
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

app.post('/api/timers/from-template', async (c) => {
  const repo = new D1TimerRepository(c.env.DB);
  const body = await c.req.parseBody() as Record<string, string>;
  const index = Number(body.templateIndex);
  const projectId = body.projectId || undefined;

  if (Number.isNaN(index) || index < 0 || index >= TIMER_TEMPLATES.length) {
    return c.redirect(projectId ? `/projects/${projectId}` : '/');
  }

  const input = buildFromTemplate(TIMER_TEMPLATES[index], new Date());
  await repo.create({ ...input, projectId });
  return c.redirect(projectId ? `/projects/${projectId}` : '/');
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

app.post('/api/timers/:id/quick-action', async (c) => {
  const repo = new D1TimerRepository(c.env.DB);
  const timer = await repo.getById(c.req.param('id'));
  if (!timer) return c.body(null, 404);

  const body = await c.req.parseBody() as Record<string, string>;
  const actionType = body.action;

  try {
    let result;
    if (actionType === 'adjust-value') {
      result = applyQuickAction(timer, { action: 'adjust-value', delta: Number(body.delta) }, new Date());
    } else if (actionType === 'reset-value') {
      result = applyQuickAction(timer, { action: 'reset-value' }, new Date());
    } else if (actionType === 'max-value') {
      result = applyQuickAction(timer, { action: 'max-value' }, new Date());
    } else {
      return c.body(null, 400);
    }

    await repo.update(timer.id, {
      type: timer.type,
      ...result,
    } as any);
  } catch {
    return c.body(null, 400);
  }

  return c.body(null, 200);
});

app.post('/api/timers/:id/priority', async (c) => {
  const repo = new D1TimerRepository(c.env.DB);
  const timer = await repo.getById(c.req.param('id'));
  if (!timer) return c.body(null, 404);

  const body = await c.req.parseBody() as Record<string, string>;
  const priority = Number(body.priority);
  if (!isPriorityLevel(priority)) return c.body(null, 400);

  await repo.updatePriority(timer.id, priority);
  return c.body(null, 200);
});

app.post('/api/timers/:id/duplicate', async (c) => {
  const repo = new D1TimerRepository(c.env.DB);
  const timer = await repo.getById(c.req.param('id'));
  if (!timer) return c.body(null, 404);

  const input = buildDuplicateInput(timer);
  await repo.create(input);
  return c.body(null, 200);
});

app.post('/api/timers/:id/archive', async (c) => {
  const repo = new D1TimerRepository(c.env.DB);
  try {
    await repo.archive(c.req.param('id'));
  } catch {
    return c.body(null, 404);
  }
  return c.body(null, 200);
});

app.post('/api/timers/:id/unarchive', async (c) => {
  const repo = new D1TimerRepository(c.env.DB);
  try {
    await repo.unarchive(c.req.param('id'));
  } catch {
    return c.body(null, 404);
  }
  return c.body(null, 200);
});

// --- Project API ---

app.post('/api/projects', async (c) => {
  const projectRepo = new D1ProjectRepository(c.env.DB);
  const body = await c.req.parseBody() as Record<string, string>;

  const result = createProjectSchema.safeParse({ name: body.name });
  if (!result.success) return c.redirect('/');

  await projectRepo.create({ name: body.name });
  return c.redirect('/');
});

app.post('/api/projects/:id', async (c) => {
  const projectRepo = new D1ProjectRepository(c.env.DB);
  const body = await c.req.parseBody() as Record<string, string>;
  const projectId = c.req.param('id');

  if (body._method === 'delete') {
    await projectRepo.delete(projectId);
    return c.redirect('/');
  }

  if (body._method === 'put') {
    const result = createProjectSchema.safeParse({ name: body.name });
    if (!result.success) return c.redirect(`/projects/${projectId}`);
    await projectRepo.update(projectId, { name: body.name });
    return c.redirect(`/projects/${projectId}`);
  }

  return c.notFound();
});

app.post('/api/timers/:id/rank', async (c) => {
  const repo = new D1TimerRepository(c.env.DB);
  const timer = await repo.getById(c.req.param('id'));
  if (!timer) return c.body(null, 404);

  const body = await c.req.json<{ rank: string }>();
  const rank = Number(body.rank);
  if (!Number.isFinite(rank)) return c.body(null, 400);

  await repo.updateRank(timer.id, rank);
  return c.body(null, 200);
});

app.post('/api/timers/:id/project', async (c) => {
  const repo = new D1TimerRepository(c.env.DB);
  const timer = await repo.getById(c.req.param('id'));
  if (!timer) return c.body(null, 404);

  const body = await c.req.parseBody() as Record<string, string>;
  const projectId = body.projectId || null;
  await repo.updateProject(timer.id, projectId);
  return c.body(null, 200);
});

export default app;
