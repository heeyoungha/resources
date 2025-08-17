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
  if (!user) return null

  const { data, error } = await supabase
    .from('shared_items')
    .insert({
      ...itemData,
      created_by: user.id
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating shared item:', error)
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
      email: user.email!,
      display_name: user.email?.split('@')[0] || user.id
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating user profile:', error)
    return null
  }

  return data
} 