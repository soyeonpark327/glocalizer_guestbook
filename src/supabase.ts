import { createClient } from '@supabase/supabase-js'

export type Entry = {
  id: string
  name: string | null
  message: string
  created_at: string
}

const url = import.meta.env.SUPABASE_URL
const key = import.meta.env.SUPABASE_ANON_KEY

if (!url || !key) {
  console.error('SUPABASE_URL / SUPABASE_ANON_KEY 가 설정되지 않았어요. .env를 확인해주세요.')
}

export const supabase = createClient(url ?? '', key ?? '', {
  auth: { persistSession: false },
})
