import { NextRequest, NextResponse } from 'next/server'
import { createServerClient as createSSRClient } from '@supabase/ssr'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  // Get current user from cookie-based auth
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
  if (!user?.email) {
    return NextResponse.json({ subscribed: false, plan: null })
  }

  // Check subscription in DB
  const supabase = createServerClient()
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan, status')
    .eq('user_email', user.email.toLowerCase())
    .eq('status', 'active')
    .single()

  if (sub) {
    return NextResponse.json({ subscribed: true, plan: sub.plan, status: sub.status })
  }

  return NextResponse.json({ subscribed: false, plan: null })
}
