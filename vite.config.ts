import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

const publicData = JSON.parse(readFileSync('src/data/public.json', 'utf8')) as {
  matches: Array<{ id: string }>
}
const publicMatchPages = publicData.matches.map((match) => ({
  path: `/matches/${match.id}`,
  prerender: { enabled: true },
}))

const config = defineConfig({
  base: process.env.VITE_BASE_PATH ?? '/',
  resolve: { tsconfigPaths: true },
  plugins: [
    devtools(),
    nitro({ rollupConfig: { external: [/^@sentry\//] } }),
    tailwindcss(),
    tanstackStart({ prerender: { enabled: true }, pages: publicMatchPages }),
    viteReact(),
  ],
})

export default config
