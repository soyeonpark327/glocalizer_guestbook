import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // .env의 SUPABASE_URL / SUPABASE_ANON_KEY를 그대로 클라이언트에 노출
  // (anon 키는 공개용 키이며, 실제 권한은 RLS로 제한됨)
  envPrefix: ['VITE_', 'SUPABASE_'],
})
