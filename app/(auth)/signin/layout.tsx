import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In | AuthFlow',
}

export default function SignInLayout({ children }: { children: React.ReactNode }) {
  return children
}
