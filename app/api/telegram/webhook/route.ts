import { NextRequest, NextResponse } from 'next/server'
import { runAgent } from '@/lib/claude'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN

async function sendTelegramMessage(chatId: number, text: string) {
  if (!BOT_TOKEN) return
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'Markdown',
    }),
  })
}

async function linkTelegram(code: string, chatId: number, username: string): Promise<boolean> {
  try {
    const { createServerClient } = await import('@/lib/supabase/server')
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from('integration_links')
      .update({
        chat_id: String(chatId),
        username: username,
        status: 'linked',
        linked_at: new Date().toISOString(),
      })
      .eq('connect_code', code.toUpperCase())
      .eq('platform', 'telegram')
      .eq('status', 'pending')
      .select()
      .single()

    return !error && !!data
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  try {
    const update = await req.json()
    const message = update.message
    if (!message || !message.text) {
      return NextResponse.json({ ok: true })
    }

    const chatId = message.chat.id
    const text = message.text.trim()
    const username = message.from?.username || message.from?.first_name || 'Unknown'

    // /start
    if (text === '/start') {
      await sendTelegramMessage(chatId,
        '🤖 *Runr Agent*\n\nYour AI agent. Always on.\n\n' +
        '*To connect your account:*\n' +
        '1. Go to runr.site/dashboard/integrations\n' +
        '2. Click Connect on Telegram\n' +
        '3. Send the code here: `/connect CODE`\n\n' +
        '*Once connected, try:*\n' +
        '• _summarize my emails_\n' +
        '• _what\'s on my calendar today_\n' +
        '• _search for latest AI news_'
      )
      return NextResponse.json({ ok: true })
    }

    // /connect CODE
    if (text.startsWith('/connect')) {
      const code = text.replace('/connect', '').trim().toUpperCase()

      if (!code || code.length !== 6) {
        await sendTelegramMessage(chatId,
          '⚠️ Invalid code. Get a 6-character code from runr.site/dashboard/integrations and send:\n`/connect ABCDEF`'
        )
        return NextResponse.json({ ok: true })
      }

      const linked = await linkTelegram(code, chatId, username)

      if (linked) {
        await sendTelegramMessage(chatId,
          '✅ *Connected!*\n\nYour Telegram is now linked to Runr. Send me any command and I\'ll handle it.\n\nTry: _summarize my emails today_'
        )
      } else {
        await sendTelegramMessage(chatId,
          '❌ Invalid or expired code. Go to runr.site/dashboard/integrations and generate a new one.'
        )
      }
      return NextResponse.json({ ok: true })
    }

    // /status
    if (text === '/status') {
      await sendTelegramMessage(chatId, '✅ Runr agent is online and ready.')
      return NextResponse.json({ ok: true })
    }

    // Process command with agent
    await sendTelegramMessage(chatId, '⏳ Processing...')

    const result = await runAgent(text)

    const response = [
      `*${result.status}*`,
      '',
      result.action,
      '',
      result.result,
      result.next ? `\n💡 _${result.next}_` : '',
      `\n⏱ ${result.duration}`,
    ].filter(Boolean).join('\n')

    await sendTelegramMessage(chatId, response)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Telegram webhook error:', err)
    return NextResponse.json({ ok: true })
  }
}

export async function GET() {
  return NextResponse.json({ status: 'Telegram webhook active' })
}
