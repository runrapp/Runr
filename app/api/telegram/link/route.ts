import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export async function POST() {
  try {
    const supabase = createServerClient()
    const code = generateCode()

    const { data, error } = await supabase
      .from('integration_links')
      .insert({
        platform: 'telegram',
        connect_code: code,
        status: 'pending',
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      code,
      id: data.id,
      botUrl: 'https://t.me/Runr_ggbot',
      instructions: `Open @Runr_ggbot on Telegram and send: /connect ${code}`,
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to generate code' },
      { status: 500 }
    )
  }
}
