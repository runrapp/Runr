import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { clientId } = await req.json()

    if (!clientId) {
      return NextResponse.json({ error: 'Client ID required' }, { status: 400 })
    }

    const supabase = createServerClient()

    await supabase
      .from('integrations')
      .delete()
      .eq('provider', 'discord')
      .filter('metadata->>client_id', 'eq', clientId)

    return NextResponse.json({ disconnected: true })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to disconnect' },
      { status: 500 }
    )
  }
}
