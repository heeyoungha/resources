export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          display_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          color: string
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          color?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          color?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      shared_items: {
        Row: {
          id: string
          title: string | null
          content: string
          description: string | null
          type: 'text' | 'url' | 'image'
          category_id: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title?: string | null
          content: string
          description?: string | null
          type: 'text' | 'url' | 'image'
          category_id?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string | null
          content?: string
          description?: string | null
          type?: 'text' | 'url' | 'image'
          category_id?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      category_stats: {
        Row: {
          id: string
          name: string
          description: string | null
          color: string
          created_at: string
          item_count: number
        }
      }
      shared_items_with_details: {
        Row: {
          id: string
          title: string | null
          content: string
          description: string | null
          type: 'text' | 'url' | 'image'
          created_at: string
          updated_at: string
          category_name: string | null
          category_color: string | null
          category_id: string | null
          author_name: string | null
          author_email: string | null
          author_id: string
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// 편의를 위한 타입 별칭
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type SharedItem = Database['public']['Tables']['shared_items']['Row']
export type CategoryStat = Database['public']['Views']['category_stats']['Row']
export type SharedItemWithDetails = Database['public']['Views']['shared_items_with_details']['Row']

// Insert/Update 타입
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type CategoryInsert = Database['public']['Tables']['categories']['Insert']
export type SharedItemInsert = Database['public']['Tables']['shared_items']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type CategoryUpdate = Database['public']['Tables']['categories']['Update']
export type SharedItemUpdate = Database['public']['Tables']['shared_items']['Update'] 