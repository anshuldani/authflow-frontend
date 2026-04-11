import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateAppeal } from '@/lib/gemini'
import type { GeneratedForm } from '@/lib/types'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    const body = await request.json() as { paId?: string; denialReason?: string }
    const { paId, denialReason } = body
    if (!paId || !denialReason || denialReason.trim().length < 10) {
      return NextResponse.json({ success: false, error: 'PA ID and denial reason are required' }, { status: 400 })
    }
    const { data: pa, error: paError } = await supabase
      .from('prior_auths')
      .select('*')
      .eq('id', paId)
      .eq('user_id', user.id)
      .single()
    if (paError || !pa) {
      return NextResponse.json({ success: false, error: 'Prior authorization not found' }, { status: 404 })
    }
    if (pa.status !== 'denied') {
      return NextResponse.json({ success: false, error: 'Only denied prior authorizations can be appealed' }, { status: 400 })
    }
    const appealText = await generateAppeal(pa.payer_id as string, pa.generated_form as GeneratedForm, denialReason)
    const { data: appeal, error: appealError } = await supabase
      .from('appeals')
      .insert({
        user_id: user.id,
        pa_id: paId,
        denial_reason: denialReason,
        generated_appeal: appealText,
        status: 'draft',
      })
      .select()
      .single()
    if (appealError) throw appealError
    await supabase.from('prior_auths').update({ status: 'appealed' }).eq('id', paId)
    return NextResponse.json({ success: true, appeal })
  } catch {
    return NextResponse.json({ success: false, error: 'Appeal generation failed. Please try again.' }, { status: 503 })
  }
}

// Ensure route is always server-rendered
export const dynamic = 'force-dynamic'
