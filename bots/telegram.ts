import { Telegraf, Context } from 'telegraf'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

if (!BOT_TOKEN) {
  console.error('FATAL: Missing TELEGRAM_BOT_TOKEN. Set it in your environment variables.')
  process.exit(1)
}

const bot = new Telegraf(BOT_TOKEN)

/* ─── Helper: Call Agent API ─── */
async function callAgent(command: string, source = 'telegram'): Promise<{
  status: string
  action: string
  result: string
  next?: string
  duration?: string
}> {
  try {
    const res = await fetch(`${APP_URL}/api/agent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command, source }),
    })

    if (!res.ok) {
      throw new Error(`Agent API returned ${res.status}`)
    }

    return await res.json()
  } catch (err) {
    return {
      status: 'FAILED',
      action: 'Agent call failed',
      result: err instanceof Error ? err.message : 'Unknown error connecting to agent.',
    }
  }
}

/* ─── Format response ─── */
function formatResponse(data: { status: string; action: string; result: string; next?: string; duration?: string }): string {
  const lines: string[] = []

  const statusIcon = data.status === 'COMPLETED' ? '✓' : data.status === 'FAILED' ? '✗' : '?'
  lines.push(`${statusIcon} ${data.action}`)
  lines.push('')
  lines.push(data.result)

  if (data.next) {
    lines.push('')
    lines.push(`→ ${data.next}`)
  }

  if (data.duration) {
    lines.push('')
    lines.push(`⏱ ${data.duration}`)
  }

  return lines.join('\n')
}

/* ─── Commands ─── */
bot.command('start', async (ctx: Context) => {
  await ctx.reply(
    `Runr Agent — active.\n\nCommands:\n/task <description> — Run a task\n/emails — Summarize recent emails\n/events — List upcoming calendar events\n/browse <url> — Browse and summarize a webpage\n/status — Check agent status`,
    { parse_mode: undefined }
  )
})

bot.command('status', async (ctx: Context) => {
  await ctx.reply('Agent status: active\nConnected to Runr API\nReady for commands.')
})

bot.command('task', async (ctx: Context) => {
  const text = (ctx.message && 'text' in ctx.message) ? ctx.message.text : ''
  const command = text.replace('/task', '').trim()

  if (!command) {
    await ctx.reply('Usage: /task <description>\nExample: /task summarize my emails today')
    return
  }

  await ctx.reply('Running...')

  const result = await callAgent(command, 'telegram')
  await ctx.reply(formatResponse(result))
})

bot.command('emails', async (ctx: Context) => {
  await ctx.reply('Checking your inbox...')

  const result = await callAgent('summarize my recent emails', 'telegram')
  await ctx.reply(formatResponse(result))
})

bot.command('events', async (ctx: Context) => {
  await ctx.reply('Checking your calendar...')

  const result = await callAgent('list my upcoming calendar events for this week', 'telegram')
  await ctx.reply(formatResponse(result))
})

bot.command('browse', async (ctx: Context) => {
  const text = (ctx.message && 'text' in ctx.message) ? ctx.message.text : ''
  const url = text.replace('/browse', '').trim()

  if (!url) {
    await ctx.reply('Usage: /browse <url>\nExample: /browse https://example.com')
    return
  }

  await ctx.reply(`Browsing ${url}...`)

  const result = await callAgent(`browse and summarize ${url}`, 'telegram')
  await ctx.reply(formatResponse(result))
})

/* ─── Handle plain text messages ─── */
bot.on('text', async (ctx) => {
  const text = ctx.message.text

  // Treat all text messages as task commands
  await ctx.reply('Running...')
  const result = await callAgent(text, 'telegram')
  await ctx.reply(formatResponse(result))
})

/* ─── Error handling ─── */
bot.catch((err: unknown) => {
  console.error('Telegram bot error:', err instanceof Error ? err.message : err)
})

/* ─── Launch ─── */
console.log('Starting Runr Telegram bot...')
bot.launch()
  .then(() => console.log('Runr Telegram bot is running.'))
  .catch((err) => {
    console.error('Failed to start Telegram bot:', err.message)
    process.exit(1)
  })

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
