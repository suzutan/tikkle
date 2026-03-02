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
      </head>
      <body class="min-h-screen bg-gray-50">
        <div class="mx-auto max-w-2xl px-4 py-8">
          <header class="mb-8">
            <a href="/" class="text-3xl font-bold text-gray-900">Tikkle</a>
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
