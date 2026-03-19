import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

// Default user_id until auth is implemented
const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000'

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json()

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Bot token is required.' }, { status: 400 })
    }

    // 1. Verify token with Telegram
    const meRes = await fetch(`https://api.telegram.org/bot${token}/getMe`)
    const meData = await meRes.json()

    if (!meData.ok) {
      return NextResponse.json({ error: 'Invalid bot token. Check your BotFather token and try again.' }, { status: 400 })
    }

    const bot = meData.result
    const botId = String(bot.id)
    const botUsername = bot.username

    // 2. Register webhook
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://runr.site'
    const webhookUrl = `${appUrl}/api/telegram/webhook/${botId}`

    const whRes = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: webhookUrl, allowed_updates: ['message'] }),
    })
    const whData = await whRes.json()

    if (!whData.ok) {
      return NextResponse.json({ error: 'Failed to set webhook. Try again.' }, { status: 500 })
    }

    // 3. Save to DB
    const supabase = createServerClient()
    const metadata = {
      bot_id: botId,
      bot_username: botUsername,
      bot_name: bot.first_name,
      webhook_url: webhookUrl,
    }

    // Check if this bot already exists
    const { data: existing } = await supabase
      .from('integrations')
      .select('id')
      .eq('provider', 'telegram')
      .eq('access_token', token)
      .single()

    if (existing) {
      await supabase
        .from('integrations')
        .update({ status: 'connected', metadata, connected_at: new Date().toISOString() })
        .eq('id', existing.id)
    } else {
      const { error } = await supabase
        .from('integrations')
        .insert({
          user_id: DEFAULT_USER_ID,
          provider: 'telegram',
          status: 'connected',
          access_token: token,
          metadata,
          connected_at: new Date().toISOString(),
        })

      if (error) {
        return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 500 })
      }
    }

    return NextResponse.json({
      connected: true,
      bot: { id: botId, username: botUsername, name: bot.first_name },
      webhookUrl,
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to connect bot' },
      { status: 500 }
    )
  }
}
