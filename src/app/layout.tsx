import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'Pingly - SMS & 메신저 마케팅 플랫폼',
  description: 'SMS, LMS, MMS, 카카오톡 알림톡/친구톡을 한 곳에서 관리하세요. 효과적인 메시지 마케팅으로 고객과 소통하세요.',
  keywords: ['SMS 마케팅', '문자 발송', '카카오톡 알림톡', '메시지 마케팅', 'Pingly'],
  authors: [{ name: 'Pingly' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Pingly',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#3B82F6',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
