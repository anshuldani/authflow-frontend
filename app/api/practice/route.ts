import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { PracticeProfile } from '@/lib/types'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('practice_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') { /* no row — fine */ }
      else { console.error('[/api/practice GET] supabase error:', error); throw error }
    }

    return NextResponse.json({ success: true, practice: data ?? null })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch practice profile' }, { status: 503 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json() as Partial<PracticeProfile>

    // Validate required fields
    const required = ['practice_name', 'physician_name', 'physician_npi', 'practice_address', 'practice_city', 'practice_state', 'practice_zip', 'practice_phone'] as const
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json({ success: false, error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    const profileData = {
      user_id: user.id,
      practice_name: body.practice_name!,
      practice_type: body.practice_type ?? null,
      specialty: body.specialty ?? null,
      physician_name: body.physician_name!,
      physician_npi: body.physician_npi!,
      physician_credentials: body.physician_credentials ?? null,
      practice_address: body.practice_address!,
      practice_city: body.practice_city!,
      practice_state: body.practice_state!,
      practice_zip: body.practice_zip!,
      practice_phone: body.practice_phone!,
      practice_fax: body.practice_fax ?? null,
      practice_tax_id: body.practice_tax_id ?? null,
      in_network_payers: body.in_network_payers ?? ['bcbs_il', 'aetna', 'uhc', 'cigna', 'humana'],
      setup_completed: true,
      setup_completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Upsert (create or update)
    const { data, error } = await supabase
      .from('practice_profiles')
      .upsert(profileData, { onConflict: 'user_id' })
      .select()
      .single()

    if (error) throw error

    // Mark setup as completed in users table
    await supabase
      .from('users')
      .update({ practice_setup_completed: true })
      .eq('id', user.id)

    return NextResponse.json({ success: true, practice: data })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to save practice profile' }, { status: 503 })
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json() as Partial<PracticeProfile>

    const { data, error } = await supabase
      .from('practice_profiles')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, practice: data })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to update practice profile' }, { status: 503 })
  }
}

export const dynamic = 'force-dynamic'
