import { jsxRenderer } from 'hono/jsx-renderer';

export const renderer = jsxRenderer(({ children, title }) => {
  return (
    <html lang="ja">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title ? `${title} - Tikkle` : 'Tikkle'}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script src="https://unpkg.com/htmx.org@2.0.4" />
        <script defer src="https://unpkg.com/alpinejs@3.14.8/dist/cdn.min.js" />
        <script src="/static/client.js" />
        <style>{`[x-cloak] { display: none !important; }`}</style>
      </head>
      <body class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <div class="mx-auto max-w-2xl px-4 py-8" x-data="darkMode()" x-init="init()">
          <header class="mb-8 flex items-center justify-between">
            <a href="/" class="text-3xl font-bold text-gray-900 dark:text-gray-100">Tikkle</a>
            <button
              x-on:click="toggle()"
              class="rounded-lg bg-gray-200 p-2 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
              aria-label="Toggle dark mode"
            >
              <svg
                x-show="!isDark"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="h-6 w-6 text-gray-700"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
                />
              </svg>
              <svg
                x-show="isDark"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="h-6 w-6 text-gray-200"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                />
              </svg>
            </button>
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
