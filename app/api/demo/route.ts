import { NextRequest, NextResponse } from 'next/server'
import { createServerClient as createSSRClient } from '@supabase/ssr'
import { createServerClient } from '@/lib/supabase/server'

// Helper: get current user from cookies
async function getUser(req: NextRequest) {
  const supabaseAuth = createSSRClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return req.cookies.getAll() },
        setAll() {},
      },
    }
  )
  const { data: { user } } = await supabaseAuth.auth.getUser()
  return user
}

// GET — check if user has used demo
export async function GET(req: NextRequest) {
  const user = await getUser(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServerClient()
  const { data } = await supabase
    .from('demo_usage')
    .select('id')
    .eq('user_id', user.id)
    .single()

  return NextResponse.json({ used: !!data })
}

// POST — mark demo as used
export async function POST(req: NextRequest) {
  const user = await getUser(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServerClient()

  // Check if already used
  const { data: existing } = await supabase
    .from('demo_usage')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'Demo already used', used: true }, { status: 403 })
  }

  // Mark as used
  const { error } = await supabase
    .from('demo_usage')
    .insert({ user_id: user.id, used_at: new Date().toISOString() })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, used: true })
}
