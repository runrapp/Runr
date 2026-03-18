import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing Supabase server environment variables. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
    )
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export async function createTask(
  supabase: ReturnType<typeof createServerClient>,
  data: {
    user_id?: string
    command: string
    status: string
    result?: string
    duration?: number
    source?: string
  }
) {
  const { data: task, error } = await supabase
    .from('tasks')
    .insert({
      user_id: data.user_id || null,
      command: data.command,
      status: data.status,
      result: data.result || null,
      duration_ms: data.duration || null,
      source: data.source || 'dashboard',
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return task
}

export async function updateTask(
  supabase: ReturnType<typeof createServerClient>,
  taskId: string,
  data: {
    status: string
    result?: string
    duration?: number
  }
) {
  const { data: task, error } = await supabase
    .from('tasks')
    .update({
      status: data.status,
      result: data.result || null,
      duration_ms: data.duration || null,
      completed_at: new Date().toISOString(),
    })
    .eq('id', taskId)
    .select()
    .single()

  if (error) throw error
  return task
}

export async function listTasks(
  supabase: ReturnType<typeof createServerClient>,
  userId?: string,
  limit = 50
) {
  let query = supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (userId) {
    query = query.eq('user_id', userId)
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}
