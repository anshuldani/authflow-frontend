import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { extractInsuranceCard } from '@/lib/gemini'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'File too large. Maximum 10MB.' }, { status: 413 })
    }

    const mimeType = file.type || 'image/jpeg'
    const supported = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!supported.includes(mimeType)) {
      return NextResponse.json(
        { success: false, error: 'Unsupported file type. Please convert your image to JPEG or PNG and try again. (iPhone HEIC photos: open in Photos app → Share → Save as JPEG)' },
        { status: 415 }
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')

    const result = await extractInsuranceCard(base64, mimeType, file.name)

    return NextResponse.json({ success: true, card: result })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Card extraction failed. Please enter the information manually.' },
      { status: 503 }
    )
  }
}

export const dynamic = 'force-dynamic'
export const maxDuration = 20
