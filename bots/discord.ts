import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  type Interaction,
} from 'discord.js'

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN
const CLIENT_ID = process.env.DISCORD_CLIENT_ID
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

if (!BOT_TOKEN) {
  console.error('FATAL: Missing DISCORD_BOT_TOKEN. Set it in your environment variables.')
  process.exit(1)
}

if (!CLIENT_ID) {
  console.error('FATAL: Missing DISCORD_CLIENT_ID. Set it in your environment variables.')
  process.exit(1)
}

/* ─── Slash Command Definitions ─── */
const commands = [
  new SlashCommandBuilder()
    .setName('task')
    .setDescription('Run a task with the Runr agent')
    .addStringOption((opt) =>
      opt.setName('command').setDescription('What should the agent do?').setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName('emails')
    .setDescription('Summarize your recent emails'),
  new SlashCommandBuilder()
    .setName('events')
    .setDescription('List upcoming calendar events'),
  new SlashCommandBuilder()
    .setName('browse')
    .setDescription('Browse and summarize a webpage')
    .addStringOption((opt) =>
      opt.setName('url').setDescription('URL to browse').setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName('status')
    .setDescription('Check agent status'),
]

/* ─── Helper: Call Agent API ─── */
async function callAgent(command: string, source = 'discord'): Promise<{
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

/* ─── Format response for Discord ─── */
function formatResponse(data: {
  status: string
  action: string
  result: string
  next?: string
  duration?: string
}): string {
  const lines: string[] = []

  const statusIcon = data.status === 'COMPLETED' ? '✓' : data.status === 'FAILED' ? '✗' : '?'
  lines.push(`**${statusIcon} ${data.action}**`)
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

  // Discord has a 2000 char limit
  const output = lines.join('\n')
  return output.length > 1950 ? output.substring(0, 1950) + '...' : output
}

/* ─── Register Commands ─── */
async function registerCommands() {
  const rest = new REST().setToken(BOT_TOKEN!)

  try {
    console.log('Registering slash commands...')
    await rest.put(Routes.applicationCommands(CLIENT_ID!), {
      body: commands.map((c) => c.toJSON()),
    })
    console.log('Slash commands registered.')
  } catch (err) {
    console.error('Failed to register commands:', err)
  }
}

/* ─── Bot Client ─── */
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
})

client.once('ready', () => {
  console.log(`Runr Discord bot online as ${client.user?.tag}`)
})

client.on('interactionCreate', async (interaction: Interaction) => {
  if (!interaction.isChatInputCommand()) return

  const cmd = interaction as ChatInputCommandInteraction

  switch (cmd.commandName) {
    case 'status': {
      await cmd.reply('Agent status: active. Connected to Runr API. Ready for commands.')
      break
    }

    case 'task': {
      const command = cmd.options.getString('command', true)
      await cmd.deferReply()
      const result = await callAgent(command, 'discord')
      await cmd.editReply(formatResponse(result))
      break
    }

    case 'emails': {
      await cmd.deferReply()
      const result = await callAgent('summarize my recent emails', 'discord')
      await cmd.editReply(formatResponse(result))
      break
    }

    case 'events': {
      await cmd.deferReply()
      const result = await callAgent('list my upcoming calendar events for this week', 'discord')
      await cmd.editReply(formatResponse(result))
      break
    }

    case 'browse': {
      const url = cmd.options.getString('url', true)
      await cmd.deferReply()
      const result = await callAgent(`browse and summarize ${url}`, 'discord')
      await cmd.editReply(formatResponse(result))
      break
    }

    default:
      await cmd.reply('Unknown command.')
  }
})

/* ─── Launch ─── */
console.log('Starting Runr Discord bot...')
registerCommands()
  .then(() => client.login(BOT_TOKEN))
  .then(() => console.log('Runr Discord bot is running.'))
  .catch((err) => {
    console.error('Failed to start Discord bot:', err.message)
    process.exit(1)
  })

// Graceful shutdown
process.once('SIGINT', () => {
  client.destroy()
  process.exit(0)
})
process.once('SIGTERM', () => {
  client.destroy()
  process.exit(0)
})
