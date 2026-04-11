import type { Metadata } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-playfair',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Authflow — Prior Authorization in 30 Seconds',
  description: 'AI-powered prior authorization for independent physician practices. Paste a note, pick a payer, get a completed form.',
  openGraph: {
    title: 'Authflow — Prior Authorization in 30 Seconds',
    description: 'AI-powered prior authorization for independent physician practices.',
    url: 'https://authflow.ai',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}

// Layout metadata is defined in the root layout
// Viewport config moved here from page-level for Next.js 14 compatibility
