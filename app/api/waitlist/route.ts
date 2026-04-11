import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { sendWaitlistConfirmation } from '@/lib/resend'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const body = await request.json() as { email?: string; source?: string }
    const { email, source = 'hero' } = body
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, error: 'Invalid email address' }, { status: 400 })
    }
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    )
    const { error } = await supabase.from('waitlist').insert({ email, source })
    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ success: true, message: "You're already on the waitlist!" })
      }
      throw error
    }
    await sendWaitlistConfirmation(email)
    return NextResponse.json({ success: true, message: "You're on the list!" })
  } catch {
    return NextResponse.json({ success: false, error: 'Something went wrong' }, { status: 500 })
  }
}
