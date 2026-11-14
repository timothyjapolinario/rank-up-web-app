import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

const developmentPublicDataPath = fileURLToPath(
  new URL('./test-data/public.json', import.meta.url),
)

const developmentPublicDataPlugin: Plugin = {
  name: 'development-public-data',
  apply: 'serve',
  configureServer(server) {
    server.middlewares.use((request, response, next) => {
      if (request.method !== 'GET' || request.url !== '/test-data/public.json') {
        return next()
      }

      void readFile(developmentPublicDataPath).then((data) => {
        response.statusCode = 200
        response.setHeader('Content-Type', 'application/json; charset=utf-8')
        response.end(data)
      }, next)
    })
  },
}

const config = defineConfig({
  base: process.env.VITE_BASE_PATH ?? '/',
  resolve: { tsconfigPaths: true },
  plugins: [
    developmentPublicDataPlugin,
    devtools(),
    nitro({ rollupConfig: { external: [/^@sentry\//] } }),
    tailwindcss(),
    tanstackStart({ prerender: { enabled: true } }),
    viteReact(),
  ],
})

export default config
