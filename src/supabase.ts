import { createClient } from '@supabase/supabase-js'

export type Entry = {
  id: string
  name: string | null
  message: string
  created_at: string
}

const url = import.meta.env.SUPABASE_URL
const key = import.meta.env.SUPABASE_ANON_KEY

// 환경변수가 없으면 createClient가 예외를 던져 화면 전체가 하얗게 멈추므로,
// 설정이 빠졌을 때는 null로 두고 화면에서 안내 문구를 보여준다.
export const supabase = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null

if (!supabase) {
  console.error('SUPABASE_URL / SUPABASE_ANON_KEY 가 설정되지 않았어요. .env 또는 Vercel 환경변수를 확인해주세요.')
}
