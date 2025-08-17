-- 프로필 테이블의 email 컬럼을 nullable로 변경
-- 카카오 로그인 시 이메일이 없을 수 있기 때문

-- 1. UNIQUE 제약조건 제거 (email이 null일 수 있으므로)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_email_key;

-- 2. NOT NULL 제약조건 제거
ALTER TABLE public.profiles ALTER COLUMN email DROP NOT NULL;

-- 3. 새로운 UNIQUE 제약조건 추가 (null 값 제외)
CREATE UNIQUE INDEX profiles_email_unique 
ON public.profiles (email) 
WHERE email IS NOT NULL; 