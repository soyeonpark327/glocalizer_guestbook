# GLOCALIZER 방명록

Glocalizer 서비스와 별개인 익명 공개 방명록. Vite + React + TypeScript + Supabase, Vercel 배포.

## 1. Supabase (전용 새 프로젝트)
1. supabase.com에서 **새 프로젝트** 생성 (Glocalizer 프로덕션과 별도)
2. SQL Editor에서 `supabase/schema.sql` 전체 실행
   - `entries` 테이블 + RLS: anon은 SELECT/INSERT만, UPDATE/DELETE 불가
   - 메시지 1~200자, 이름 30자 제한은 DB 체크 제약으로도 걸려 있음
3. Project Settings > API에서 URL과 `anon` public key 복사

## 2. 로컬 실행
```bash
cp .env.example .env   # 값 채우기
npm install
npm run dev
```
로고는 `public/logo.png`에 두세요 (헤더와 파비콘에 사용).

## 3. Vercel 배포 (별도 프로젝트)
1. 이 폴더를 새 Git 레포로 push → Vercel에서 **New Project**로 import
   (또는 `npx vercel` 로 CLI 배포)
2. Framework: Vite (자동 감지), Build: `npm run build`, Output: `dist`
3. Environment Variables에 `SUPABASE_URL`, `SUPABASE_ANON_KEY` 추가
4. Settings > Domains에서 메인 서비스와 다른 도메인 연결

## 스팸 관리
- 폼에 숨김 honeypot 필드(`website`)가 있어 봇이 채우면 저장하지 않음
- 삭제는 Supabase 대시보드 Table Editor에서 직접
