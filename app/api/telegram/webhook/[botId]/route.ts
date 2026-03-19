import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { runAgent } from '@/lib/claude'

async function sendMessage(token: string, chatId: number, text: string) {
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'Markdown',
    }),
  })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ botId: string }> }
) {
  try {
    const { botId } = await params
    const update = await req.json()
    const message = update.message

    if (!message || !message.text) {
      return NextResponse.json({ ok: true })
    }

    // Look up bot token from DB
    const supabase = createServerClient()
    const { data: integration } = await supabase
      .from('integrations')
      .select('access_token, metadata')
      .eq('provider', 'telegram')
      .eq('status', 'connected')
      .filter('metadata->>bot_id', 'eq', botId)
      .single()

    if (!integration?.access_token) {
      return NextResponse.json({ ok: true }) // Bot not found, ignore
    }

    const token = integration.access_token
    const chatId = message.chat.id
    const text = message.text.trim()

    // /start
    if (text === '/start') {
      await sendMessage(token, chatId,
        `🤖 *${integration.metadata?.bot_name || 'Runr Agent'}*\n\n` +
        'Your personal AI agent. Send me any command:\n\n' +
        '• _summarize my emails_\n' +
        '• _what\'s on my calendar today_\n' +
        '• _search for latest AI news_\n' +
        '• _browse https://example.com_\n\n' +
        'Type anything to get started.'
      )
      return NextResponse.json({ ok: true })
    }

    // /status
    if (text === '/status') {
      await sendMessage(token, chatId, '✅ Agent is online and ready.')
      return NextResponse.json({ ok: true })
    }

    // Process with agent
    await sendMessage(token, chatId, '⏳ Processing...')

    // Update last_used_at
    await supabase
      .from('integrations')
      .update({ last_used_at: new Date().toISOString() })
      .eq('provider', 'telegram')
      .filter('metadata->>bot_id', 'eq', botId)

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

    await sendMessage(token, chatId, response)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Telegram webhook error:', err)
    return NextResponse.json({ ok: true })
  }
}

export async function GET() {
  return NextResponse.json({ status: 'Telegram webhook active' })
}
