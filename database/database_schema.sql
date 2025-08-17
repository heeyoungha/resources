-- ===============================================
-- 모임 링크 공유 플랫폼 데이터베이스 스키마
-- ===============================================

-- 1. 사용자 프로필 테이블 (Supabase Auth 확장)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 카테고리 테이블
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT NOT NULL DEFAULT 'bg-blue-100 text-blue-800',
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 공유 콘텐츠 테이블
CREATE TABLE IF NOT EXISTS public.shared_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT,
    content TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('text', 'url', 'image')),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===============================================
-- RLS (Row Level Security) 정책 설정
-- ===============================================

-- 테이블 RLS 활성화
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_items ENABLE ROW LEVEL SECURITY;

-- 프로필 테이블 정책
CREATE POLICY "사용자는 자신의 프로필을 볼 수 있음" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "사용자는 자신의 프로필을 업데이트할 수 있음" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "사용자는 자신의 프로필을 삽입할 수 있음" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 카테고리 테이블 정책 (모든 인증된 사용자가 읽기 가능, 생성자만 수정 가능)
CREATE POLICY "인증된 사용자는 모든 카테고리를 볼 수 있음" ON public.categories
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "인증된 사용자는 카테고리를 생성할 수 있음" ON public.categories
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "생성자는 자신의 카테고리를 수정할 수 있음" ON public.categories
    FOR UPDATE TO authenticated USING (auth.uid() = created_by);

CREATE POLICY "생성자는 자신의 카테고리를 삭제할 수 있음" ON public.categories
    FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- 공유 아이템 테이블 정책 (모든 인증된 사용자가 읽기 가능, 생성자만 수정 가능)
CREATE POLICY "인증된 사용자는 모든 공유 아이템을 볼 수 있음" ON public.shared_items
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "인증된 사용자는 공유 아이템을 생성할 수 있음" ON public.shared_items
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "생성자는 자신의 공유 아이템을 수정할 수 있음" ON public.shared_items
    FOR UPDATE TO authenticated USING (auth.uid() = created_by);

CREATE POLICY "생성자는 자신의 공유 아이템을 삭제할 수 있음" ON public.shared_items
    FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- ===============================================
-- 기본 데이터 삽입
-- ===============================================

-- 기본 카테고리 생성 (시스템 카테고리)
INSERT INTO public.categories (name, description, color, created_by) VALUES
    ('기술', '개발, 프로그래밍, IT 관련', 'bg-blue-100 text-blue-800', NULL),
    ('디자인', 'UI/UX, 그래픽 디자인', 'bg-purple-100 text-purple-800', NULL),
    ('비즈니스', '창업, 마케팅, 경영', 'bg-green-100 text-green-800', NULL),
    ('라이프스타일', '취미, 여행, 건강', 'bg-yellow-100 text-yellow-800', NULL),
    ('교육', '학습 자료, 강의, 책', 'bg-red-100 text-red-800', NULL)
ON CONFLICT (name) DO NOTHING;

-- ===============================================
-- 트리거 함수 (자동 업데이트)
-- ===============================================

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 각 테이블에 updated_at 트리거 적용
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shared_items_updated_at BEFORE UPDATE ON public.shared_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===============================================
-- 사용자 가입 시 프로필 자동 생성 함수
-- ===============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, display_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- auth.users에 새 사용자 생성 시 프로필 자동 생성 트리거
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===============================================
-- 유용한 뷰 생성
-- ===============================================

-- 카테고리별 아이템 수 뷰
CREATE OR REPLACE VIEW public.category_stats AS
SELECT 
    c.id,
    c.name,
    c.description,
    c.color,
    c.created_at,
    COUNT(si.id) as item_count
FROM public.categories c
LEFT JOIN public.shared_items si ON c.id = si.category_id
GROUP BY c.id, c.name, c.description, c.color, c.created_at
ORDER BY c.created_at;

-- 공유 아이템과 관련 정보 조인 뷰
CREATE OR REPLACE VIEW public.shared_items_with_details AS
SELECT 
    si.id,
    si.title,
    si.content,
    si.description,
    si.type,
    si.created_at,
    si.updated_at,
    c.name as category_name,
    c.color as category_color,
    c.id as category_id,
    p.display_name as author_name,
    p.email as author_email,
    si.created_by as author_id
FROM public.shared_items si
LEFT JOIN public.categories c ON si.category_id = c.id
LEFT JOIN public.profiles p ON si.created_by = p.id
ORDER BY si.created_at DESC; 