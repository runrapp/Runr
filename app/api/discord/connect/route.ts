import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000'

export async function POST(req: NextRequest) {
  try {
    const { botToken, clientId } = await req.json()

    if (!botToken || !clientId) {
      return NextResponse.json({ error: 'Bot token and Client ID are required.' }, { status: 400 })
    }

    // 1. Verify token
    const meRes = await fetch('https://discord.com/api/v10/users/@me', {
      headers: { 'Authorization': `Bot ${botToken}` },
    })

    if (!meRes.ok) {
      return NextResponse.json({ error: 'Invalid bot token. Check your Discord Developer Portal and try again.' }, { status: 400 })
    }

    const bot = await meRes.json()

    // 2. Register slash commands
    const commands = [
      {
        name: 'task',
        description: 'Run a task with your AI agent',
        options: [{
          name: 'command',
          description: 'What do you want the agent to do?',
          type: 3,
          required: true,
        }],
      },
      { name: 'status', description: 'Check if the agent is online' },
    ]

    const cmdRes = await fetch(`https://discord.com/api/v10/applications/${clientId}/commands`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bot ${botToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(commands),
    })

    const cmdData = await cmdRes.json()
    const registeredCount = Array.isArray(cmdData) ? cmdData.length : 0

    // 3. Save to DB
    const supabase = createServerClient()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://runr.site'
    const metadata = {
      client_id: clientId,
      bot_id: bot.id,
      bot_username: bot.username,
      bot_name: bot.global_name || bot.username,
      commands_registered: registeredCount,
      interactions_url: `${appUrl}/api/discord/interactions/${clientId}`,
    }

    const { data: existing } = await supabase
      .from('integrations')
      .select('id')
      .eq('provider', 'discord')
      .eq('access_token', botToken)
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
          provider: 'discord',
          status: 'connected',
          access_token: botToken,
          metadata,
          connected_at: new Date().toISOString(),
        })

      if (error) {
        return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 500 })
      }
    }

    const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=2147483648&scope=bot%20applications.commands`

    return NextResponse.json({
      connected: true,
      bot: { id: bot.id, username: bot.username, name: bot.global_name || bot.username },
      commandsRegistered: registeredCount,
      inviteUrl,
      interactionsUrl: metadata.interactions_url,
      note: `Set your Discord app's Interactions Endpoint URL to: ${metadata.interactions_url}`,
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to connect bot' },
      { status: 500 }
    )
  }
}
