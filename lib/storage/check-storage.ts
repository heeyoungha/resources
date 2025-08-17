import { createClient } from '@/lib/supabase/client'

export async function checkStorageSetup() {
  const supabase = createClient()
  
  try {
    console.log('🔍 Supabase Storage 설정 확인 중...')
    
    // 1. 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) {
      console.error('❌ 인증 에러:', authError.message)
      return false
    }
    
    if (!user) {
      console.error('❌ 사용자가 로그인되지 않았습니다')
      return false
    }
    
    console.log('✅ 사용자 인증 확인됨:', user.email)
    
    // 2. Storage 버킷 확인
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()
    if (bucketError) {
      console.error('❌ 버킷 조회 에러:', bucketError.message)
      return false
    }
    
    console.log('📋 조회된 모든 버킷:', buckets?.map(b => ({ name: b.name, id: b.id, public: b.public })))
    
    const imagesBucket = buckets?.find(bucket => bucket.name === 'images')
    if (!imagesBucket) {
      console.warn('⚠️ "images" 버킷이 조회되지 않습니다.')
      console.log('📝 다음을 확인해주세요:')
      console.log('1. Supabase 대시보드 > Storage에서 "images" 버킷이 실제로 생성되었는지')
      console.log('2. 버킷 이름이 정확히 "images"인지 (대소문자 구분)')
      console.log('3. 버킷이 Public으로 설정되었는지')
      
      // 바로 업로드 테스트를 시도해보자 (버킷이 있지만 조회 권한이 없을 수도 있음)
      console.log('🔍 직접 업로드 테스트를 시도합니다...')
    } else {
      console.log('✅ "images" 버킷 발견됨')
    }
    
    // 버킷 정보 표시 (조회된 경우에만)
    if (imagesBucket) {
      console.log('   - Public:', imagesBucket.public)
      console.log('   - ID:', imagesBucket.id)
    }
    
    // 3. 업로드 테스트 (작은 텍스트 파일)
    const testFileName = `test-${Date.now()}.txt`
    const testFile = new File(['test'], testFileName, { type: 'text/plain' })
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('images')
      .upload(`${user.id}/${testFileName}`, testFile)
    
    if (uploadError) {
      console.error('❌ 업로드 테스트 실패:', uploadError.message)
      console.log('📝 이는 보통 Storage 정책 문제입니다.')
      console.log('📝 다음 SQL을 Supabase SQL Editor에서 실행하세요:')
      console.log(`
-- 다음 SQL을 Supabase SQL Editor에서 실행하세요:

-- 기존 정책 삭제 (있을 경우)
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;

-- 새 정책 생성
CREATE POLICY "Authenticated users can upload" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');

CREATE POLICY "Anyone can view images" ON storage.objects 
FOR SELECT USING (bucket_id = 'images');

CREATE POLICY "Users can delete own images" ON storage.objects 
FOR DELETE USING (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]);
      `)
      return false
    }
    
    console.log('✅ 업로드 테스트 성공:', uploadData.path)
    
    // 4. 테스트 파일 삭제
    await supabase.storage.from('images').remove([uploadData.path])
    console.log('✅ 테스트 파일 정리 완료')
    
    console.log('🎉 Supabase Storage 설정이 올바릅니다!')
    return true
    
  } catch (error) {
    console.error('❌ Storage 확인 중 예상치 못한 에러:', error)
    return false
  }
} 