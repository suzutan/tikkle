import { jsxRenderer } from 'hono/jsx-renderer';

export const renderer = jsxRenderer(({ children, title }) => {
  return (
    <html lang="ja">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title ? `${title} - Tikkle` : 'Tikkle'}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script dangerouslySetInnerHTML={{
          __html: `tailwind.config={darkMode:'class'};(function(){var d=localStorage.getItem('darkMode');if(d==='true'||(d===null&&matchMedia('(prefers-color-scheme:dark)').matches))document.documentElement.classList.add('dark')})();`
        }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap" rel="stylesheet" />
        <script src="https://unpkg.com/htmx.org@2.0.4" />
        <script defer src="https://unpkg.com/alpinejs@3.14.8/dist/cdn.min.js" />
        <script src="/static/client.js" />
        <style>{`[x-cloak] { display: none !important; } .font-timer { font-family: 'Share Tech Mono', monospace; font-variant-numeric: tabular-nums; }`}</style>
      </head>
      <body class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <div class="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8" x-data="darkMode()" x-init="init()">
          <header class="mb-8 flex items-center justify-between">
            <a href="/" class="text-3xl font-bold text-gray-900 dark:text-gray-100">Tikkle</a>
            <div class="flex rounded-lg border border-gray-300 dark:border-gray-600">
              <button
                x-on:click="setMode(false)"
                x-bind:class="!isDark ? 'bg-blue-600 text-white dark:bg-blue-500' : 'bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-300'"
                class="flex items-center gap-2 rounded-l-lg px-3 py-2 transition-colors"
                aria-label="Light mode"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="h-5 w-5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                  />
                </svg>
                <span class="text-sm font-medium">Light</span>
              </button>
              <button
                x-on:click="setMode(true)"
                x-bind:class="isDark ? 'bg-blue-600 text-white dark:bg-blue-500' : 'bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-300'"
                class="flex items-center gap-2 rounded-r-lg px-3 py-2 transition-colors"
                aria-label="Dark mode"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="h-5 w-5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
                  />
                </svg>
                <span class="text-sm font-medium">Dark</span>
              </button>
            </div>
            <div x-data="notificationToggle()" x-show="isSupported" x-cloak>
              <button
                x-on:click="toggle()"
                x-bind:class="isEnabled ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'"
                class="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                x-bind:title="isEnabled ? '通知ON' : '通知OFF'"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-5 w-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
              </button>
            </div>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
});

declare module 'hono/jsx-renderer' {
  interface Props {
    title?: string;
  }
}
