import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 8080,
    host: '0.0.0.0',
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8081',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      }
    }
  }
})
