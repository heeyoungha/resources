import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '모임 링크 공유 플랫폼',
  description: '관심사별로 유용한 링크와 자료를 공유하고 히스토리를 관리하세요',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
} 