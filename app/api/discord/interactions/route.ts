import { NextRequest, NextResponse } from 'next/server'
import { runAgent } from '@/lib/claude'

const PING = 1
const APPLICATION_COMMAND = 2
const DEFERRED_CHANNEL_MESSAGE = 5

async function followUpDiscord(applicationId: string, interactionToken: string, content: string) {
  await fetch(`https://discord.com/api/v10/webhooks/${applicationId}/${interactionToken}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Respond to Discord PING verification
    if (body.type === PING) {
      return NextResponse.json({ type: 1 })
    }

    if (body.type === APPLICATION_COMMAND) {
      const commandName = body.data.name
      const applicationId = body.application_id
      const interactionToken = body.token

      if (commandName === 'task') {
        const command = body.data.options?.[0]?.value || ''

        // Process async, respond with deferred
        setTimeout(async () => {
          try {
            const result = await runAgent(command)
            const response = `**${result.status}**\n${result.action}\n\n${result.result}${result.next ? `\n\n💡 *${result.next}*` : ''}\n⏱ ${result.duration}`
            await followUpDiscord(applicationId, interactionToken, response)
          } catch (err) {
            await followUpDiscord(applicationId, interactionToken,
              `❌ Error: ${err instanceof Error ? err.message : 'Unknown error'}`
            )
          }
        }, 0)

        return NextResponse.json({ type: DEFERRED_CHANNEL_MESSAGE })
      }

      if (commandName === 'status') {
        return NextResponse.json({
          type: 4,
          data: { content: '✅ Runr agent is online and ready.' },
        })
      }

      if (commandName === 'emails') {
        setTimeout(async () => {
          try {
            const result = await runAgent('summarize my recent emails')
            await followUpDiscord(applicationId, interactionToken, result.result)
          } catch (err) {
            await followUpDiscord(applicationId, interactionToken,
              `❌ Error: ${err instanceof Error ? err.message : 'Unknown error'}`
            )
          }
        }, 0)
        return NextResponse.json({ type: DEFERRED_CHANNEL_MESSAGE })
      }

      if (commandName === 'events') {
        setTimeout(async () => {
          try {
            const result = await runAgent('show my upcoming calendar events')
            await followUpDiscord(applicationId, interactionToken, result.result)
          } catch (err) {
            await followUpDiscord(applicationId, interactionToken,
              `❌ Error: ${err instanceof Error ? err.message : 'Unknown error'}`
            )
          }
        }, 0)
        return NextResponse.json({ type: DEFERRED_CHANNEL_MESSAGE })
      }

      return NextResponse.json({
        type: 4,
        data: { content: `Unknown command: ${commandName}` },
      })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Discord interaction error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ status: 'Discord interactions endpoint active' })
}
