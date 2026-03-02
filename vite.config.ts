import { defineConfig } from 'vite';
import build from '@hono/vite-build/cloudflare-pages';
import devServer from '@hono/vite-dev-server';
import adapter from '@hono/vite-dev-server/cloudflare';

export default defineConfig(({ mode }) => {
  if (mode === 'client') {
    return {
      build: {
        rollupOptions: {
          input: './src/client/timer-display.ts',
          output: {
            entryFileNames: 'static/client.js',
          },
        },
        outDir: './dist',
        emptyOutDir: false,
        copyPublicDir: false,
      },
    };
  }

  return {
    plugins: [
      build({ entry: 'src/index.tsx' }),
      devServer({
        adapter,
        entry: 'src/index.tsx',
      }),
    ],
  };
});
