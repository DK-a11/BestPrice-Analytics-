import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'dismay-bonanza-duo.ngrok-free.dev',  // Ваш ngrok URL
      '.ngrok-free.dev'  // Или так — разрешить все ngrok домены
    ],
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:4200',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
       // Добавляем CORS-заголовки для разрешения доступа с ngrok
      }
    }
  }
})
