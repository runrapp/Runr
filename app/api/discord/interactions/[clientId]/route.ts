import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { runAgent } from '@/lib/claude'

const PING = 1
const APPLICATION_COMMAND = 2
const DEFERRED_CHANNEL_MESSAGE = 5

async function followUp(applicationId: string, token: string, content: string) {
  await fetch(`https://discord.com/api/v10/webhooks/${applicationId}/${token}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params
    const body = await req.json()

    // Discord PING verification
    if (body.type === PING) {
      return NextResponse.json({ type: 1 })
    }

    if (body.type === APPLICATION_COMMAND) {
      const commandName = body.data.name
      const applicationId = body.application_id
      const interactionToken = body.token

      // Update last_used_at
      const supabase = createServerClient()
      await supabase
        .from('integrations')
        .update({ last_used_at: new Date().toISOString() })
        .eq('provider', 'discord')
        .filter('metadata->>client_id', 'eq', clientId)

      if (commandName === 'task') {
        const command = body.data.options?.[0]?.value || ''

        setTimeout(async () => {
          try {
            const result = await runAgent(command)
            const response = `**${result.status}**\n${result.action}\n\n${result.result}${result.next ? `\n\n💡 *${result.next}*` : ''}\n⏱ ${result.duration}`
            await followUp(applicationId, interactionToken, response)
          } catch (err) {
            await followUp(applicationId, interactionToken,
              `❌ Error: ${err instanceof Error ? err.message : 'Unknown error'}`)
          }
        }, 0)

        return NextResponse.json({ type: DEFERRED_CHANNEL_MESSAGE })
      }

      if (commandName === 'status') {
        return NextResponse.json({
          type: 4,
          data: { content: '✅ Agent is online and ready.' },
        })
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
