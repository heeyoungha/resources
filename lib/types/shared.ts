// 공통 UI 타입 정의
export interface SharedItem {
  id: string;
  type: 'text' | 'url' | 'image';
  content: string;
  title?: string | null;
  description?: string | null;
  category: string;
  author: string;
  timestamp: Date;
  // 데이터베이스 호환 필드들 (선택적)
  created_at?: string;
  updated_at?: string;
  category_name?: string | null;
  category_color?: string | null;
  category_id?: string | null;
  author_name?: string | null;
  author_email?: string | null;
  author_id?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string | null;
  color: string;
  // 데이터베이스 호환 필드들 (선택적)
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

// 데이터베이스 타입을 UI 타입으로 변환하는 유틸리티 함수들
export function convertDBCategoryToUI(dbCategory: any): Category {
  return {
    id: dbCategory.id,
    name: dbCategory.name,
    description: dbCategory.description,
    color: dbCategory.color,
    created_by: dbCategory.created_by,
    created_at: dbCategory.created_at,
    updated_at: dbCategory.updated_at
  };
}

export function convertDBItemToUI(dbItem: any): SharedItem {
  return {
    id: dbItem.id,
    type: dbItem.type,
    content: dbItem.content,
    title: dbItem.title,
    description: dbItem.description,
    category: dbItem.category_id || '',
    author: dbItem.author_name || dbItem.author_email || 'Unknown',
    timestamp: new Date(dbItem.created_at),
    created_at: dbItem.created_at,
    updated_at: dbItem.updated_at,
    category_name: dbItem.category_name,
    category_color: dbItem.category_color,
    category_id: dbItem.category_id,
    author_name: dbItem.author_name,
    author_email: dbItem.author_email,
    author_id: dbItem.author_id
  };
} 