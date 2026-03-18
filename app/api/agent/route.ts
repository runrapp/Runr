import { NextRequest, NextResponse } from 'next/server'
import { runAgent } from '@/lib/claude'
import { createServerClient, createTask, listTasks } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { command } = body

    if (!command || typeof command !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid command.' },
        { status: 400 }
      )
    }

    // Create task record
    let taskId: string | null = null
    try {
      const supabase = createServerClient()
      const task = await createTask(supabase, {
        command,
        status: 'running',
        source: body.source || 'dashboard',
      })
      taskId = task.id
    } catch {
      // Supabase may not be configured yet — continue without persistence
    }

    // Run the agent
    const startTime = Date.now()
    const result = await runAgent(command, {
      accessToken: body.accessToken,
      calendarToken: body.calendarToken,
    })

    const duration = Date.now() - startTime

    // Update task record
    if (taskId) {
      try {
        const supabase = createServerClient()
        await supabase
          .from('tasks')
          .update({
            status: result.status === 'COMPLETED' ? 'completed' : 'failed',
            result: result.result,
            duration_ms: duration,
            completed_at: new Date().toISOString(),
          })
          .eq('id', taskId)
      } catch {
        // Continue without persistence
      }
    }

    return NextResponse.json({
      ...result,
      taskId,
      duration: `${duration}ms`,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message, status: 'FAILED' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action')

  if (action === 'list') {
    try {
      const supabase = createServerClient()
      const tasks = await listTasks(supabase)
      return NextResponse.json({ tasks })
    } catch {
      return NextResponse.json({ tasks: [] })
    }
  }

  return NextResponse.json({ status: 'Agent API active', version: '1.0.0' })
}
