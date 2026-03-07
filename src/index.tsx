import { Hono } from 'hono';
import { renderer } from './renderer';
import { D1TimerRepository } from './repository/timer';
import { createTimerSchema } from './domain/timer/validation';
import { getUrgencyLevel, compareByUrgency } from './domain/timer/urgency';
import { applyQuickAction } from './domain/timer/quick-actions';
import { datetimeLocalToISO } from './lib/timezone';
import { TimerCard, TimerCardEmpty, TimerListItem } from './views/timer-card';
import { TimerForm } from './views/timer-form';
import { TIMER_TYPE_LABELS } from './lib/timer-type-labels';
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
  const timers = await repo.getAll();
  const archivedTimers = await repo.getArchived();
  const now = new Date();

  // Sort by urgency (overdue > today > soon > normal)
  const sortedTimers = [...timers].sort((a, b) => compareByUrgency(a, b, now));

  // Compute urgency map for client-side filtering
  const urgencyMap = Object.fromEntries(
    timers.map(t => [t.id, getUrgencyLevel(t, now)])
  );

  // Extract all unique tags from timers
  const allTags = Array.from(new Set(timers.flatMap(t => t.tags || [])));

  return c.render(
    <div
      x-data={`{ viewMode: localStorage.getItem('viewMode') || 'card', filterType: readFilterFromUrl('type'), filterTags: readFilterFromUrl('tags'), filterUrgency: readFilterFromUrl('urgency'), searchQuery: new URLSearchParams(location.search).get('q') || '', typeSearch: '', tagSearch: '', showArchived: false, urgencyMap: ${JSON.stringify(urgencyMap)} }`}
      x-init="$watch('filterType', v => syncFilterToUrl('type', v)); $watch('filterTags', v => syncFilterToUrl('tags', v)); $watch('filterUrgency', v => syncFilterToUrl('urgency', v)); $watch('searchQuery', v => syncFilterToUrl('q', v ? [v] : []))"
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

          <div class="relative" x-data="{ templateOpen: false }" {...{ 'x-on:click.outside': 'templateOpen = false' }}>
            <button
              x-on:click="templateOpen = !templateOpen"
              class="flex items-center gap-1 rounded-lg border border-blue-600 px-3 py-2 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-4 w-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
              </svg>
              テンプレート
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="h-3 w-3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            <div x-show="templateOpen" x-cloak class="absolute right-0 z-20 mt-1 w-72 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-700">
              <div class="p-1">
                {TIMER_TEMPLATES.map((tmpl, i) => (
                  <form method="post" action="/api/timers/from-template" class="contents">
                    <input type="hidden" name="templateIndex" value={String(i)} />
                    <button
                      type="submit"
                      class="w-full rounded-md px-3 py-2 text-left transition-colors hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      <div class="text-sm font-medium text-gray-900 dark:text-gray-100">{tmpl.label}</div>
                      <div class="text-xs text-gray-500 dark:text-gray-400">{tmpl.description}</div>
                    </button>
                  </form>
                ))}
              </div>
            </div>
          </div>

          <a
            href="/timers/new"
            class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            新規作成
          </a>
          </div>
        </div>

        {/* Search */}
        <div class="mb-3">
          <div class="relative">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              x-model="searchQuery"
              placeholder="タイマー名・タグで検索..."
              class="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-500"
            />
          </div>
        </div>

        {/* Filters */}
        <div class="flex flex-wrap gap-3 rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
          {/* Type multi-select */}
          <div class="flex-1 min-w-[200px]" x-data="{ typeOpen: false }" {...{ 'x-on:click.outside': 'typeOpen = false' }}>
            <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">種別でフィルター</label>
            <div class="relative">
              <div
                x-on:click="typeOpen = true; $nextTick(() => $refs.typeInput.focus())"
                class="flex min-h-[38px] w-full cursor-text flex-wrap items-center gap-1 rounded-lg border border-gray-300 bg-white px-2 py-1.5 transition-colors dark:border-gray-600 dark:bg-gray-700"
                x-bind:class="typeOpen ? 'border-blue-500 ring-1 ring-blue-500 dark:border-blue-400 dark:ring-blue-400' : ''"
              >
                {Object.entries(TIMER_TYPE_LABELS).map(([value, label]) => (
                  <span
                    x-show={`filterType.includes('${value}')`}
                    x-cloak
                    class="inline-flex items-center gap-0.5 rounded bg-blue-100 py-0.5 pl-2 pr-1 text-xs font-medium text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                  >
                    {label}
                    <button
                      type="button"
                      x-on:click={`$event.stopPropagation(); filterType = filterType.filter(x => x !== '${value}')`}
                      class="ml-0.5 rounded p-0.5 hover:bg-blue-200 dark:hover:bg-blue-800"
                    >
                      <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </span>
                ))}
                <input
                  x-ref="typeInput"
                  type="text"
                  x-model="typeSearch"
                  x-on:focus="typeOpen = true"
                  x-bind:placeholder="filterType.length === 0 ? '種別を選択...' : ''"
                  x-bind:size="Math.max(1, typeSearch.length || (filterType.length === 0 ? 8 : 1))"
                  class="min-w-[20px] flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-gray-100 dark:placeholder:text-gray-500"
                />
              </div>
              <div x-show="typeOpen" x-cloak class="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-700">
                <div class="max-h-52 overflow-y-auto p-1">
                  {Object.entries(TIMER_TYPE_LABELS).map(([value, label]) => (
                    <div
                      x-show={`'${label}'.includes(typeSearch) || '${value}'.includes(typeSearch) || typeSearch === ''`}
                      x-on:click={`filterType.includes('${value}') ? filterType = filterType.filter(x => x !== '${value}') : filterType = [...filterType, '${value}']; typeSearch = ''`}
                      class="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-600"
                    >
                      <svg
                        x-show={`filterType.includes('${value}')`}
                        class="h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400"
                        fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
                      ><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                      <div x-show={`!filterType.includes('${value}')`} class="h-4 w-4 flex-shrink-0"></div>
                      {label}
                    </div>
                  ))}
                  <div
                    x-show={`${JSON.stringify(Object.entries(TIMER_TYPE_LABELS).map(([v, l]) => [v, l]))}.every(([v,l]) => !l.includes(typeSearch) && !v.includes(typeSearch) && typeSearch !== '')`}
                    class="px-2 py-3 text-center text-xs text-gray-400 dark:text-gray-500"
                  >一致する種別がありません</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tag multi-select */}
          {allTags.length > 0 && (
            <div class="flex-1 min-w-[200px]" x-data="{ tagOpen: false }" {...{ 'x-on:click.outside': 'tagOpen = false' }}>
              <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">タグでフィルター</label>
              <div class="relative">
                <div
                  x-on:click="tagOpen = true; $nextTick(() => $refs.tagInput.focus())"
                  class="flex min-h-[38px] w-full cursor-text flex-wrap items-center gap-1 rounded-lg border border-gray-300 bg-white px-2 py-1.5 transition-colors dark:border-gray-600 dark:bg-gray-700"
                  x-bind:class="tagOpen ? 'border-blue-500 ring-1 ring-blue-500 dark:border-blue-400 dark:ring-blue-400' : ''"
                >
                  {allTags.map((tag) => (
                    <span
                      x-show={`filterTags.includes('${tag}')`}
                      x-cloak
                      class="inline-flex items-center gap-0.5 rounded bg-green-100 py-0.5 pl-2 pr-1 text-xs font-medium text-green-800 dark:bg-green-900/40 dark:text-green-300"
                    >
                      {tag}
                      <button
                        type="button"
                        x-on:click={`$event.stopPropagation(); filterTags = filterTags.filter(x => x !== '${tag}')`}
                        class="ml-0.5 rounded p-0.5 hover:bg-green-200 dark:hover:bg-green-800"
                      >
                        <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </span>
                  ))}
                  <input
                    x-ref="tagInput"
                    type="text"
                    x-model="tagSearch"
                    x-on:focus="tagOpen = true"
                    x-bind:placeholder="filterTags.length === 0 ? 'タグを選択...' : ''"
                    x-bind:size="Math.max(1, tagSearch.length || (filterTags.length === 0 ? 8 : 1))"
                    class="min-w-[20px] flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-gray-100 dark:placeholder:text-gray-500"
                  />
                </div>
                <div x-show="tagOpen" x-cloak class="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-700">
                  <div class="max-h-52 overflow-y-auto p-1">
                    {allTags.map((tag) => (
                      <div
                        x-show={`'${tag}'.toLowerCase().includes(tagSearch.toLowerCase()) || tagSearch === ''`}
                        x-on:click={`filterTags.includes('${tag}') ? filterTags = filterTags.filter(x => x !== '${tag}') : filterTags = [...filterTags, '${tag}']; tagSearch = ''`}
                        class="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-600"
                      >
                        <svg
                          x-show={`filterTags.includes('${tag}')`}
                          class="h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400"
                          fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
                        ><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                        <div x-show={`!filterTags.includes('${tag}')`} class="h-4 w-4 flex-shrink-0"></div>
                        {tag}
                      </div>
                    ))}
                    <div
                      x-show={`${JSON.stringify(allTags)}.every(t => !t.toLowerCase().includes(tagSearch.toLowerCase()) && tagSearch !== '')`}
                      class="px-2 py-3 text-center text-xs text-gray-400 dark:text-gray-500"
                    >一致するタグがありません</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Urgency filter */}
          <div class="flex-1 min-w-[200px]">
            <label class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">緊急度でフィルター</label>
            <div class="flex flex-wrap gap-1.5">
              {([
                ['overdue', '期限超過', 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'],
                ['today', '今日中', 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300'],
                ['soon', '3日以内', 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300'],
                ['normal', '通常', 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'],
              ] as const).map(([value, label, activeClass]) => (
                <button
                  type="button"
                  x-on:click={`filterUrgency.includes('${value}') ? filterUrgency = filterUrgency.filter(x => x !== '${value}') : filterUrgency = [...filterUrgency, '${value}']`}
                  x-bind:class={`filterUrgency.includes('${value}') ? '${activeClass} ring-2 ring-offset-1 ring-blue-400' : 'bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400'`}
                  class="rounded-full px-2.5 py-1 text-xs font-medium transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div class="flex items-end">
            <button
              type="button"
              x-on:click="filterType = []; filterTags = []; filterUrgency = []; searchQuery = ''; typeSearch = ''; tagSearch = ''"
              x-show="filterType.length > 0 || filterTags.length > 0 || filterUrgency.length > 0 || searchQuery"
              class="rounded-lg px-3 py-2 text-sm text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
            >
              クリア
            </button>
          </div>
        </div>
      </div>

      {/* Card view */}
      <div x-show="viewMode === 'card'" class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3" id="timer-list">
        {sortedTimers.length === 0 && <TimerCardEmpty />}
        {sortedTimers.map((timer) => {
          const timerJson = JSON.stringify(timer).replace(/</g, '\\u003c').replace(/'/g, "\\'");
          return (
            <div
              data-timer-card
              x-show={`(() => {
                const timer = ${timerJson};
                if (filterType.length > 0 && !filterType.includes(timer.type)) return false;
                if (filterTags.length > 0 && (!timer.tags || !filterTags.some(tag => timer.tags.includes(tag)))) return false;
                if (filterUrgency.length > 0 && !filterUrgency.includes(urgencyMap[timer.id])) return false;
                if (searchQuery) { const q = searchQuery.toLowerCase(); if (!timer.name.toLowerCase().includes(q) && !(timer.tags || []).some(t => t.toLowerCase().includes(q))) return false; }
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
        {sortedTimers.length === 0 && <TimerCardEmpty />}
        {sortedTimers.map((timer) => {
          const timerJson = JSON.stringify(timer).replace(/</g, '\\u003c').replace(/'/g, "\\'");
          return (
            <div
              data-timer-card
              x-show={`(() => {
                const timer = ${timerJson};
                if (filterType.length > 0 && !filterType.includes(timer.type)) return false;
                if (filterTags.length > 0 && (!timer.tags || !filterTags.some(tag => timer.tags.includes(tag)))) return false;
                if (filterUrgency.length > 0 && !filterUrgency.includes(urgencyMap[timer.id])) return false;
                if (searchQuery) { const q = searchQuery.toLowerCase(); if (!timer.name.toLowerCase().includes(q) && !(timer.tags || []).some(t => t.toLowerCase().includes(q))) return false; }
                return true;
              })()`}
            >
              <TimerListItem timer={timer} />
            </div>
          );
        })}
      </div>

      {/* Archived timers section */}
      {archivedTimers.length > 0 && (
        <div class="mt-8">
          <button
            x-on:click="showArchived = !showArchived"
            class="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="h-4 w-4 transition-transform"
              x-bind:class="showArchived ? 'rotate-90' : ''"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
            アーカイブ済み ({archivedTimers.length})
          </button>

          <div x-show="showArchived" x-cloak class="mt-4">
            <div x-show="viewMode === 'card'" class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {archivedTimers.map((timer) => (
                <div data-timer-card>
                  <TimerCard timer={timer} archived />
                </div>
              ))}
            </div>
            <div x-show="viewMode === 'list'" class="space-y-2">
              {archivedTimers.map((timer) => (
                <div data-timer-card>
                  <TimerListItem timer={timer} archived />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>,
  );
});

app.get('/timers/new', async (c) => {
  const repo = new D1TimerRepository(c.env.DB);
  const timers = await repo.getAll({ includeArchived: true });
  const allTags = Array.from(new Set(timers.flatMap(t => t.tags || [])));
  return c.render(<TimerForm allTags={allTags} />, { title: '新規作成' });
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
  return c.render(<TimerForm timer={timer} allTags={allTags} />, { title: '編集' });
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

app.post('/api/timers/from-template', async (c) => {
  const repo = new D1TimerRepository(c.env.DB);
  const body = await c.req.parseBody() as Record<string, string>;
  const index = Number(body.templateIndex);

  if (Number.isNaN(index) || index < 0 || index >= TIMER_TEMPLATES.length) {
    return c.redirect('/');
  }

  const input = buildFromTemplate(TIMER_TEMPLATES[index], new Date());
  await repo.create(input);
  return c.redirect('/');
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

export default app;
