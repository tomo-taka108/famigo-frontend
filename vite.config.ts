import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
      port: 5173,       // ★ 必ず5173で起動する
      strictPort: true, // ★ ポートが埋まっていたらエラーにする（勝手に切り替えない）
    },
})
