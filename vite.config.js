import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    open: true,
    proxy: {
      '/api/adzuna': {
        target: 'https://api.adzuna.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/adzuna/, ''),
      },
      '/api/remotive': {
        target: 'https://remotive.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/remotive/, ''),
      },
    },
  },
})