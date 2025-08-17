import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/types/database'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          if (typeof document !== 'undefined') {
            const value = document.cookie
              .split('; ')
              .find(row => row.startsWith(name + '='))
              ?.split('=')[1]
            
            if (value) {
              try {
                return decodeURIComponent(value)
              } catch (e) {
                return value
              }
            }
          }
          return undefined
        },
        set(name: string, value: string, options: any) {
          if (typeof document !== 'undefined') {
            try {
              const encodedValue = encodeURIComponent(value)
              let cookieString = `${name}=${encodedValue}; path=/; SameSite=Lax`
              if (options?.maxAge) {
                cookieString += `; max-age=${options.maxAge}`
              }
              if (options?.expires) {
                cookieString += `; expires=${options.expires}`
              }
              document.cookie = cookieString
            } catch (e) {
              // Cookie 설정 실패 시 무시
            }
          }
        },
        remove(name: string, options: any) {
          if (typeof document !== 'undefined') {
            document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`
          }
        },
      },
    }
  )
} 