import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['qrcode'],
  },
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://ingressos-corporativos.vercel.app',
        changeOrigin: true,
        secure: true,
      }
    }
  }
})
