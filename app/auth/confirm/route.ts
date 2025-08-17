import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { type EmailOtpType } from '@supabase/supabase-js'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/'

  if (!token_hash || !type) {
    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=missing_parameters`)
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })

    if (error) {
      return NextResponse.redirect(`${origin}/auth/auth-code-error?error=verification_failed`)
    }

    if (data.user) {
      return NextResponse.redirect(`${origin}${next}`)
    }

    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=no_user_data`)
  } catch (err) {
    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=unexpected_error`)
  }
} 