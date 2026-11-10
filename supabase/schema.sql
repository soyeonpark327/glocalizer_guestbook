-- Glocalizer 방명록 전용 Supabase 프로젝트의 SQL Editor에서 한 번 실행하세요.

create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  name text,
  message text not null,
  created_at timestamptz not null default now(),
  constraint entries_name_len check (name is null or char_length(name) <= 30),
  constraint entries_message_len check (char_length(btrim(message)) between 1 and 200)
);

create index if not exists entries_created_at_idx on public.entries (created_at desc);

alter table public.entries enable row level security;

-- anon: 읽기/쓰기만 허용
drop policy if exists "anon can read entries" on public.entries;
create policy "anon can read entries"
  on public.entries for select
  to anon
  using (true);

drop policy if exists "anon can insert entries" on public.entries;
create policy "anon can insert entries"
  on public.entries for insert
  to anon
  with check (true);

-- UPDATE / DELETE 정책은 만들지 않음 → RLS에 의해 거부됨.
-- 테이블 권한 자체도 회수해 이중으로 막아둠. (대시보드/service_role은 영향 없음)
revoke update, delete, truncate on public.entries from anon, authenticated;
