// Supabase Storage 설정 확인 및 생성 스크립트
// 이 스크립트는 Supabase 대시보드에서 수동으로 실행하거나 참고용으로 사용합니다.

// 1. Supabase 대시보드 > Storage 섹션으로 이동
// 2. "Create bucket" 클릭
// 3. Bucket name: "images"
// 4. Public bucket: true (체크)
// 5. File size limit: 5MB
// 6. Allowed MIME types: image/jpeg, image/jpg, image/png, image/gif, image/webp

// 또는 SQL로 실행 (Supabase SQL Editor에서):

/*
-- 이미지 버킷 생성
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true);

-- 업로드 정책 (인증된 사용자만 업로드 가능)
CREATE POLICY "Anyone can upload images" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');

-- 읽기 정책 (모든 사람이 읽기 가능)
CREATE POLICY "Anyone can view images" ON storage.objects 
FOR SELECT USING (bucket_id = 'images');

-- 삭제 정책 (본인이 업로드한 파일만 삭제 가능)
CREATE POLICY "Users can delete own images" ON storage.objects 
FOR DELETE USING (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]);
*/

console.log('Supabase Storage 설정:');
console.log('1. Supabase 대시보드에서 Storage > Create bucket');
console.log('2. Bucket name: "images"');
console.log('3. Public bucket: true');
console.log('4. 위의 SQL 정책들을 SQL Editor에서 실행'); 