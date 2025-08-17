import { createClient } from '@/lib/supabase/client'
import type { Database, Category, SharedItem, SharedItemWithDetails, CategoryInsert, SharedItemInsert } from '@/lib/types/database'

// 카테고리 관련 함수들
export async function getCategories(): Promise<Category[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }

  return data || []
}

export async function createCategory(categoryData: Omit<CategoryInsert, 'created_by'>): Promise<Category | null> {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('categories')
    .insert({
      ...categoryData,
      created_by: user.id
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating category:', error)
    return null
  }

  return data
}

// 공유 아이템 관련 함수들
export async function getSharedItems(): Promise<SharedItemWithDetails[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('shared_items_with_details')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching shared items:', error)
    return []
  }

  return data || []
}

export async function createSharedItem(itemData: Omit<SharedItemInsert, 'created_by'>): Promise<SharedItem | null> {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  // 임시 사용자를 위한 처리
  let userId = user?.id;
  if (!userId) {
    // localStorage에서 임시 사용자 확인
    if (typeof window !== 'undefined') {
      const tempUser = localStorage.getItem('temp_kakao_user');
      if (tempUser) {
        try {
          const parsedUser = JSON.parse(tempUser);
          userId = parsedUser.id;
        } catch (e) {
          console.error('Failed to parse temp user:', e);
        }
      }
    }
    
    // 여전히 사용자가 없으면 임시 ID 생성
    if (!userId) {
      userId = 'anonymous_' + Date.now();
    }
  }

  const { data, error } = await supabase
    .from('shared_items')
    .insert({
      ...itemData,
      created_by: user?.id || null  // 실제 사용자만 ID 저장, 임시 사용자는 null
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating shared item:', error)
    console.error('Error details:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    })
    return null
  }

  return data
}

// 사용자 프로필 관련 함수들
export async function getCurrentUserProfile() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('Error fetching user profile:', error)
    return null
  }

  return data
}

export async function ensureUserProfile() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // 프로필이 있는지 확인
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (existingProfile) {
    return existingProfile
  }

  // 프로필이 없으면 생성
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: user.id,
      email: user.email || null,
      display_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || `사용자_${user.id.slice(0, 8)}`
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating user profile:', error)
    return null
  }

  return data
} 