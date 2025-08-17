import { createClient } from '@/lib/supabase/client'

export interface UploadImageResult {
  success: boolean
  url?: string
  error?: string
}

export async function uploadImage(file: File): Promise<UploadImageResult> {
  const supabase = createClient()
  
  // 파일 크기 체크 (5MB 제한)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return {
      success: false,
      error: '파일 크기가 5MB를 초과합니다.'
    }
  }

  // 이미지 파일 타입 체크
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return {
      success: false,
      error: '지원되는 이미지 형식: JPEG, PNG, GIF, WebP'
    }
  }

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return {
        success: false,
        error: '로그인이 필요합니다.'
      }
    }

    // 파일명 생성 (타임스탬프 + 원본 파일명)
    const timestamp = Date.now()
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${timestamp}.${fileExt}`

    // Supabase Storage에 업로드
    const { data, error } = await supabase.storage
      .from('images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Storage upload error:', error)
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      })
      return {
        success: false,
        error: `이미지 업로드에 실패했습니다: ${error.message || '알 수 없는 오류'}`
      }
    }

    // 공개 URL 생성
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(data.path)

    return {
      success: true,
      url: publicUrl
    }
  } catch (error) {
    console.error('Upload error:', error)
    return {
      success: false,
      error: '이미지 업로드 중 오류가 발생했습니다.'
    }
  }
}

export async function deleteImage(url: string): Promise<boolean> {
  const supabase = createClient()
  
  try {
    // URL에서 파일 경로 추출
    const path = url.split('/').slice(-2).join('/')
    
    const { error } = await supabase.storage
      .from('images')
      .remove([path])

    if (error) {
      console.error('Storage delete error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Delete error:', error)
    return false
  }
} 