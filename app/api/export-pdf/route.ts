import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const BACKEND_URL = process.env.AUTHFLOW_BACKEND_URL?.replace(/\/$/, '') ?? ''

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!BACKEND_URL) {
      return NextResponse.json({ error: 'Backend not configured' }, { status: 503 })
    }

    const body = await request.json()
    const { data: { session } } = await supabase.auth.getSession()

    const res = await fetch(`${BACKEND_URL}/export-pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: `PDF generation failed: ${err}` }, { status: res.status })
    }

    const pdfBytes = await res.arrayBuffer()
    const contentDisposition = res.headers.get('content-disposition') ?? 'attachment; filename="PA_form.pdf"'

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': contentDisposition,
      },
    })
  } catch (err) {
    console.error('[/api/export-pdf]', err)
    return NextResponse.json({ error: 'PDF export failed' }, { status: 503 })
  }
}
