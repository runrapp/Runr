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

export async function POST(req: NextRequest) {
  try {
    const update = await req.json()
    const message = update.message
    if (!message || !message.text) {
      return NextResponse.json({ ok: true })
    }

    const chatId = message.chat.id
    const text = message.text.trim()

    if (text === '/start') {
      await sendTelegramMessage(chatId,
        '🤖 *Runr Agent*\n\nYour AI agent. Always on.\n\nSend me any command:\n• _summarize my emails_\n• _what\'s on my calendar_\n• _search for latest AI news_\n• _browse https://example.com_\n\nType anything to get started.'
      )
      return NextResponse.json({ ok: true })
    }

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
