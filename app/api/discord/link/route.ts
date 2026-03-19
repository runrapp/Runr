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
        platform: 'discord',
        connect_code: code,
        status: 'pending',
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      code,
      id: data.id,
      inviteUrl: `https://discord.com/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&permissions=2147483648&scope=bot%20applications.commands`,
      instructions: `Add Runr bot to your server, then use: /connect code:${code}`,
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to generate code' },
      { status: 500 }
    )
  }
}
