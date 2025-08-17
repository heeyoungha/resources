import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/types/database'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set(name, value, {
              ...options,
              secure: false, // localhost에서는 false
              sameSite: 'lax',
              path: '/',
            })
          } catch {
            // Server Component에서 호출된 경우 무시
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set(name, '', {
              ...options,
              expires: new Date(0),
            })
          } catch {
            // Server Component에서 호출된 경우 무시
          }
        },
      },
    }
  )
} 