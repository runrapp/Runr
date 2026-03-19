import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const code = new URL(req.url).searchParams.get('code')

  if (!code) {
    return NextResponse.json({ error: 'Missing code parameter' }, { status: 400 })
  }

  try {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from('integration_links')
      .select('*')
      .eq('connect_code', code)
      .eq('platform', 'telegram')
      .single()

    if (error || !data) {
      return NextResponse.json({ status: 'not_found' }, { status: 404 })
    }

    return NextResponse.json({
      status: data.status,
      chatId: data.chat_id,
      username: data.username,
      linkedAt: data.linked_at,
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to check status' },
      { status: 500 }
    )
  }
}
