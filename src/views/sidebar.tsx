import type { Project } from '../domain/project/types';

export function Sidebar({ projects, currentProjectId }: { projects: Project[]; currentProjectId?: string }) {
  return (
    <aside class="w-full md:w-64 flex-shrink-0">
      <nav class="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
        <a
          href="/"
          class={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${!currentProjectId ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-4 w-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
          すべて
        </a>

        <div class="my-2 border-t border-gray-200 dark:border-gray-700"></div>

        <div class="mb-2 flex items-center justify-between px-3">
          <span class="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">プロジェクト</span>
        </div>

        {projects.map((project) => (
          <a
            href={`/projects/${project.id}`}
            class={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${currentProjectId === project.id ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}
          >
            <span class="truncate">{project.name}</span>
          </a>
        ))}

        {/* Add project form */}
        <form method="post" action="/api/projects" class="mt-2 flex gap-1 px-1">
          <input
            type="text"
            name="name"
            placeholder="新規プロジェクト"
            required
            class="flex-1 rounded border border-gray-300 bg-white px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          />
          <button
            type="submit"
            class="rounded bg-blue-600 px-2 py-1.5 text-sm text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="h-4 w-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        </form>
      </nav>
    </aside>
  );
}
