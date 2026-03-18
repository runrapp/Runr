import Anthropic from '@anthropic-ai/sdk'
import { readEmails, sendEmail } from './gmail'
import { listEvents, createEvent } from './calendar'
import { browseUrl } from './browser'

const SYSTEM_PROMPT = `You are Runr, a personal AI agent. You execute real tasks for the user.

Your capabilities:
- Email: Read, summarize, and send emails via Gmail
- Calendar: Create, list, and manage Google Calendar events
- Web: Browse and summarize any public webpage
- Messaging: Respond via Telegram and Discord

Rules:
1. Never execute destructive actions without explicit user confirmation
2. Always summarize the intended action before executing
3. If ambiguous, ask for clarification
4. Log all actions
5. Be concise — no filler words, no corporate language

Response format:
- Status: COMPLETED | FAILED | NEEDS_CLARIFICATION
- Action: one-sentence summary of what you did
- Result: the actual output
- Next: optional suggested follow-up`

interface AgentResult {
  status: 'COMPLETED' | 'FAILED' | 'NEEDS_CLARIFICATION'
  action: string
  result: string
  next?: string
  duration?: string
}

export async function runAgent(command: string, context?: {
  accessToken?: string
  calendarToken?: string
}): Promise<AgentResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('Missing ANTHROPIC_API_KEY. Set it in your .env.local file.')
  }

  const startTime = Date.now()
  const client = new Anthropic({ apiKey })

  // Determine intent and gather data
  const intentPrompt = `Analyze this user command and determine what action to take:
"${command}"

Respond with JSON:
{
  "intent": "email_read" | "email_send" | "calendar_list" | "calendar_create" | "web_browse" | "general",
  "params": { ... relevant parameters ... }
}`

  const intentResponse = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 500,
    messages: [{ role: 'user', content: intentPrompt }],
  })

  let intentText = ''
  for (const block of intentResponse.content) {
    if (block.type === 'text') intentText += block.text
  }

  let intent: { intent: string; params: Record<string, string> }
  try {
    // Extract JSON from response
    const jsonMatch = intentText.match(/\{[\s\S]*\}/)
    intent = jsonMatch ? JSON.parse(jsonMatch[0]) : { intent: 'general', params: {} }
  } catch {
    intent = { intent: 'general', params: {} }
  }

  // Execute based on intent
  let taskData = ''

  try {
    switch (intent.intent) {
      case 'email_read': {
        if (!context?.accessToken) {
          return {
            status: 'FAILED',
            action: 'Attempted to read emails',
            result: 'Gmail is not connected. Go to Integrations to connect your Gmail account.',
            duration: `${Date.now() - startTime}ms`,
          }
        }
        const emails = await readEmails(context.accessToken, 10)
        taskData = `User's recent emails:\n${JSON.stringify(emails, null, 2)}`
        break
      }

      case 'email_send': {
        if (!context?.accessToken) {
          return {
            status: 'FAILED',
            action: 'Attempted to send email',
            result: 'Gmail is not connected. Go to Integrations to connect your Gmail account.',
            duration: `${Date.now() - startTime}ms`,
          }
        }
        taskData = `User wants to send email. Params: ${JSON.stringify(intent.params)}`
        break
      }

      case 'calendar_list': {
        if (!context?.calendarToken) {
          return {
            status: 'FAILED',
            action: 'Attempted to list calendar events',
            result: 'Google Calendar is not connected. Go to Integrations to connect.',
            duration: `${Date.now() - startTime}ms`,
          }
        }
        const events = await listEvents(context.calendarToken)
        taskData = `User's upcoming events:\n${JSON.stringify(events, null, 2)}`
        break
      }

      case 'calendar_create': {
        if (!context?.calendarToken) {
          return {
            status: 'FAILED',
            action: 'Attempted to create calendar event',
            result: 'Google Calendar is not connected. Go to Integrations to connect.',
            duration: `${Date.now() - startTime}ms`,
          }
        }
        taskData = `User wants to create event. Params: ${JSON.stringify(intent.params)}`
        break
      }

      case 'web_browse': {
        const url = intent.params.url || intent.params.query
        if (url) {
          const content = await browseUrl(url)
          taskData = `Web page content:\n${content.substring(0, 3000)}`
        } else {
          taskData = 'User wants web research but no URL provided.'
        }
        break
      }

      default:
        taskData = 'General task — no specific integration required.'
    }
  } catch (err) {
    taskData = `Error executing ${intent.intent}: ${err instanceof Error ? err.message : 'Unknown error'}`
  }

  // Generate final response with Claude
  const finalResponse = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1000,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Command: "${command}"\n\nTask data:\n${taskData}\n\nProvide your response following the required format.`,
      },
    ],
  })

  let responseText = ''
  for (const block of finalResponse.content) {
    if (block.type === 'text') responseText += block.text
  }

  const duration = `${Date.now() - startTime}ms`

  // Parse response
  const statusMatch = responseText.match(/Status:\s*(COMPLETED|FAILED|NEEDS_CLARIFICATION)/i)
  const actionMatch = responseText.match(/Action:\s*(.+)/i)
  const resultMatch = responseText.match(/Result:\s*([\s\S]*?)(?=Next:|$)/i)
  const nextMatch = responseText.match(/Next:\s*(.+)/i)

  return {
    status: (statusMatch?.[1]?.toUpperCase() as AgentResult['status']) || 'COMPLETED',
    action: actionMatch?.[1]?.trim() || 'Processed your command.',
    result: resultMatch?.[1]?.trim() || responseText,
    next: nextMatch?.[1]?.trim(),
    duration,
  }
}
