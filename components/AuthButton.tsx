'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

interface AuthButtonProps {
  user: User | null
}

export function AuthButton({ user }: AuthButtonProps) {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [message, setMessage] = useState('')
  const supabase = createClient()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setMessage('올바른 이메일 형식을 입력해주세요 (예: user@example.com)')
      return
    }

    setLoading(true)
    setMessage('')
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`
        }
      })
      
      if (error) {
        setMessage(`오류: ${error.message}`)
      } else {
        setMessage(`📧 ${email}로 인증 링크를 보내드렸습니다. 이메일을 확인해주세요!`)
        setShowEmailForm(false)
        setEmail('')
      }
    } catch (error) {
      setMessage('로그인 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleKakaoSignIn = async () => {
    setLoading(true)
    setMessage('')
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'kakao',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            scope: 'profile_nickname'
          }
        }
      })
      
      if (error) {
        setMessage(`카카오 로그인 오류: ${error.message}`)
        setLoading(false)
      }
      // 성공 시 카카오 로그인 페이지로 리다이렉트됨
    } catch (error) {
      setMessage('카카오 로그인 중 오류가 발생했습니다.')
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        setMessage(`로그아웃 오류: ${error.message}`)
      } else {
        // 로그아웃 성공 시 페이지 새로고침
        window.location.reload()
      }
      setMessage('')
    } catch (error) {
      setMessage('로그아웃 처리 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (user) {
    return (
      <button
        onClick={handleSignOut}
        disabled={loading}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
      >
        {loading ? '로그아웃 중...' : '로그아웃'}
      </button>
    )
  }

  if (showEmailForm) {
    return (
      <div className="flex flex-col gap-2 min-w-[300px]">
        <form onSubmit={handleSignIn} className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-medium text-gray-700">
            이메일 주소를 정확히 입력해주세요
          </label>
          <input
            id="email"
            type="email"
            placeholder="example@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading || !email}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? '전송 중...' : '인증 링크 전송'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowEmailForm(false)
                setEmail('')
                setMessage('')
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              취소
            </button>
          </div>
        </form>
        {message && (
          <p className={`text-sm ${message.includes('오류') ? 'text-red-600' : 'text-green-600'}`}>
            {message}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleKakaoSignIn}
        disabled={loading}
        className="px-4 py-2 bg-yellow-400 text-black font-medium rounded hover:bg-yellow-500 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          '카카오 로그인 중...'
        ) : (
          <>
            <span>💬</span>
            카카오톡으로 로그인
          </>
        )}
      </button>
      <button
        onClick={() => setShowEmailForm(true)}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        이메일로 로그인
      </button>
      {message && (
        <div className="flex flex-col gap-2">
          <p className={`text-sm ${message.includes('오류') ? 'text-red-600' : 'text-green-600'}`}>
            {message}
          </p>
          {message.includes('📧') && (
            <button
              onClick={() => {
                setShowEmailForm(true)
                setMessage('')
              }}
              className="text-xs text-blue-500 hover:text-blue-700 underline self-start"
            >
              다른 이메일로 다시 시도
            </button>
          )}
        </div>
      )}
    </div>
  )
} 