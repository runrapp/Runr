import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

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

    // 2. Register webhook pointing to our dynamic route
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://runr.site'
    const webhookUrl = `${appUrl}/api/telegram/webhook/${botId}`

    const whRes = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ['message'],
      }),
    })
    const whData = await whRes.json()

    if (!whData.ok) {
      return NextResponse.json({ error: 'Failed to set webhook. Try again.' }, { status: 500 })
    }

    // 3. Save to integrations table
    const supabase = createServerClient()

    // Upsert — if this bot already exists, update it
    const { error: dbError } = await supabase
      .from('integrations')
      .upsert({
        id: undefined,
        provider: 'telegram',
        status: 'connected',
        access_token: token,
        metadata: {
          bot_id: botId,
          bot_username: botUsername,
          bot_name: bot.first_name,
          webhook_url: webhookUrl,
        },
        connected_at: new Date().toISOString(),
      }, {
        onConflict: 'provider,access_token',
        ignoreDuplicates: false,
      })

    // If upsert with onConflict fails (no unique constraint), try insert
    if (dbError) {
      // Check if already exists
      const { data: existing } = await supabase
        .from('integrations')
        .select('id')
        .eq('provider', 'telegram')
        .eq('access_token', token)
        .single()

      if (existing) {
        await supabase
          .from('integrations')
          .update({
            status: 'connected',
            metadata: {
              bot_id: botId,
              bot_username: botUsername,
              bot_name: bot.first_name,
              webhook_url: webhookUrl,
            },
            connected_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
      } else {
        const { error: insertErr } = await supabase
          .from('integrations')
          .insert({
            provider: 'telegram',
            status: 'connected',
            access_token: token,
            metadata: {
              bot_id: botId,
              bot_username: botUsername,
              bot_name: bot.first_name,
              webhook_url: webhookUrl,
            },
            connected_at: new Date().toISOString(),
          })

        if (insertErr) {
          return NextResponse.json({ error: `Database error: ${insertErr.message}` }, { status: 500 })
        }
      }
    }

    return NextResponse.json({
      connected: true,
      bot: {
        id: botId,
        username: botUsername,
        name: bot.first_name,
      },
      webhookUrl,
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to connect bot' },
      { status: 500 }
    )
  }
}
