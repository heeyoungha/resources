-- 카카오 로그인 등 이메일이 없는 OAuth 로그인을 위한 handle_new_user 함수 수정

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, display_name)
    VALUES (
        NEW.id,
        NEW.email, -- null일 수 있음
        COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name', 
            NEW.raw_user_meta_data->>'display_name',
            CASE 
                WHEN NEW.email IS NOT NULL THEN split_part(NEW.email, '@', 1)
                ELSE '사용자_' || substr(NEW.id::text, 1, 8)
            END
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 