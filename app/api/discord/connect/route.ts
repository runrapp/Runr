import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { botToken, clientId } = await req.json()

    if (!botToken || !clientId) {
      return NextResponse.json({ error: 'Bot token and Client ID are required.' }, { status: 400 })
    }

    // 1. Verify token with Discord
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

    // 3. Save to integrations table
    const supabase = createServerClient()

    const { data: existing } = await supabase
      .from('integrations')
      .select('id')
      .eq('provider', 'discord')
      .eq('access_token', botToken)
      .single()

    const integrationData = {
      provider: 'discord',
      status: 'connected',
      access_token: botToken,
      metadata: {
        client_id: clientId,
        bot_id: bot.id,
        bot_username: bot.username,
        bot_name: bot.global_name || bot.username,
        commands_registered: registeredCount,
        interactions_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://runr.site'}/api/discord/interactions/${clientId}`,
      },
      connected_at: new Date().toISOString(),
    }

    if (existing) {
      await supabase.from('integrations').update(integrationData).eq('id', existing.id)
    } else {
      const { error } = await supabase.from('integrations').insert(integrationData)
      if (error) {
        return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 500 })
      }
    }

    // 4. Generate invite URL
    const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=2147483648&scope=bot%20applications.commands`

    return NextResponse.json({
      connected: true,
      bot: {
        id: bot.id,
        username: bot.username,
        name: bot.global_name || bot.username,
      },
      commandsRegistered: registeredCount,
      inviteUrl,
      interactionsUrl: integrationData.metadata.interactions_url,
      note: `Set your Discord app's Interactions Endpoint URL to: ${integrationData.metadata.interactions_url}`,
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to connect bot' },
      { status: 500 }
    )
  }
}
