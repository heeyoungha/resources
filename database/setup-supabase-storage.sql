-- Supabase Storage 완전 설정 스크립트
-- 이 스크립트를 Supabase SQL Editor에서 실행하세요

-- 1. 기존 정책 삭제 (있을 경우)
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own" ON storage.objects;

-- 2. 이미지 버킷 생성 (이미 존재하면 무시)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('images', 'images', true, 52428800) -- 50MB
ON CONFLICT (id) DO NOTHING;

-- 3. Storage 정책 생성

-- 인증된 사용자만 이미지 업로드 가능
CREATE POLICY "Authenticated users can upload images" ON storage.objects 
FOR INSERT WITH CHECK (
  bucket_id = 'images' 
  AND auth.role() = 'authenticated'
);

-- 모든 사람이 이미지 읽기 가능 (Public bucket이므로)
CREATE POLICY "Anyone can view images" ON storage.objects 
FOR SELECT USING (bucket_id = 'images');

-- 사용자는 본인이 업로드한 이미지만 삭제 가능
CREATE POLICY "Users can delete own images" ON storage.objects 
FOR DELETE USING (
  bucket_id = 'images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 4. 확인 쿼리
SELECT 
  'Bucket created successfully' as status,
  id,
  name,
  public,
  file_size_limit
FROM storage.buckets 
WHERE name = 'images';

SELECT 
  'Policies created successfully' as status,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%images%'; 