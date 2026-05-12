import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Join the Waitlist | AuthFlow',
  description: 'Be the first to access AuthFlow — AI-powered prior authorization, simplified.',
}

export default function WaitlistLayout({ children }: { children: React.ReactNode }) {
  return children
}
