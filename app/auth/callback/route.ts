import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { ensureUserProfile } from '@/lib/database/queries'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const error_description = searchParams.get('error_description')
  
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/'

  // Handle OAuth errors
  if (error) {
    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${encodeURIComponent(error)}`)
  }

  if (code) {
    try {
      console.log('🔍 Auth callback received code:', code.substring(0, 20) + '...')
      const supabase = await createClient()
      console.log('🔍 Supabase client created')
      
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      console.log('🔍 Exchange completed')
      
      console.log('🔍 Session exchange result:', { 
        user: data.user ? {
          id: data.user.id,
          email: data.user.email,
          user_metadata: data.user.user_metadata,
          app_metadata: data.user.app_metadata
        } : null,
        session: data.session ? 'exists' : 'null',
        error: exchangeError
      })
      
      // 사용자가 있으면 성공으로 간주 (이메일 오류 무시)
      if (data.user) {
        console.log('✅ User found, proceeding with login:', data.user.id)
        
        try {
          // 프로필 생성 시도 (이미 있으면 무시됨)
          await ensureUserProfile()
          console.log('✅ User profile ensured')
        } catch (profileError) {
          console.warn('⚠️ Profile creation failed, but continuing:', profileError)
        }
        
        const forwardedHost = request.headers.get('x-forwarded-host')
        const isLocalEnv = process.env.NODE_ENV === 'development'
        
        if (isLocalEnv) {
          return NextResponse.redirect(`${origin}${next}`)
        } else if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}${next}`)
        } else {
          return NextResponse.redirect(`${origin}${next}`)
        }
      } 
      
      // 이메일 오류지만 세션이 있으면 강제로 성공 처리
      else if (data.session && exchangeError?.message?.includes('email')) {
        console.log('🔧 Email error but session exists, forcing success')
        
        const forwardedHost = request.headers.get('x-forwarded-host')
        const isLocalEnv = process.env.NODE_ENV === 'development'
        
        if (isLocalEnv) {
          return NextResponse.redirect(`${origin}${next}`)
        } else if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}${next}`)
        } else {
          return NextResponse.redirect(`${origin}${next}`)
        }
      }
      
      else {
        console.error('❌ No user found after exchange:', exchangeError)
        return NextResponse.redirect(`${origin}/auth/auth-code-error?error=session_exchange_failed&details=${encodeURIComponent(exchangeError?.message || 'unknown')}`)
      }
    } catch (err) {
      console.error('💥 Exception during session exchange:', err)
      return NextResponse.redirect(`${origin}/auth/auth-code-error?error=unexpected_error&details=${encodeURIComponent((err as Error).message)}`)
    }
  }

  // No code parameter provided
  return NextResponse.redirect(`${origin}/auth/auth-code-error?error=no_code_provided`)
} 