-- 카카오 로그인 사용자를 위한 RLS 정책 강화

-- 기존 정책들이 잘 작동하는지 확인하고 필요시 업데이트

-- 1. 프로필 테이블: 더 관대한 정책 추가 (백업용)
DROP POLICY IF EXISTS "모든 인증된 사용자는 프로필을 읽을 수 있음" ON public.profiles;
CREATE POLICY "모든 인증된 사용자는 프로필을 읽을 수 있음" ON public.profiles
    FOR SELECT TO authenticated USING (true);

-- 2. 카테고리 테이블: 이미 올바름 (확인용)
-- "인증된 사용자는 모든 카테고리를 볼 수 있음" 정책이 이미 있음

-- 3. 공유 아이템 테이블: 이미 올바름 (확인용)
-- "인증된 사용자는 모든 공유 아이템을 볼 수 있음" 정책이 이미 있음

-- 4. 뷰에 대한 권한 부여
GRANT SELECT ON public.shared_items_with_details TO authenticated;
GRANT SELECT ON public.category_stats TO authenticated; 