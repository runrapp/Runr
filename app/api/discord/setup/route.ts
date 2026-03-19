import { NextResponse } from 'next/server'

export async function GET() {
  const botToken = process.env.DISCORD_BOT_TOKEN
  const clientId = process.env.DISCORD_CLIENT_ID

  if (!botToken || !clientId) {
    return NextResponse.json({ error: 'Missing DISCORD_BOT_TOKEN or DISCORD_CLIENT_ID' }, { status: 500 })
  }

  const commands = [
    {
      name: 'connect',
      description: 'Link Runr to this Discord channel',
      options: [
        {
          name: 'code',
          description: '6-character code from runr.site/dashboard/integrations',
          type: 3,
          required: true,
        },
      ],
    },
    {
      name: 'task',
      description: 'Run a task with Runr agent',
      options: [
        {
          name: 'command',
          description: 'What do you want Runr to do?',
          type: 3,
          required: true,
        },
      ],
    },
    {
      name: 'status',
      description: 'Check if Runr agent is online',
    },
    {
      name: 'emails',
      description: 'Summarize recent emails',
    },
    {
      name: 'events',
      description: 'Show upcoming calendar events',
    },
  ]

  const res = await fetch(`https://discord.com/api/v10/applications/${clientId}/commands`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bot ${botToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(commands),
  })

  const data = await res.json()

  return NextResponse.json({
    registered: Array.isArray(data) ? data.length : 0,
    commands: data,
  })
}
