import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { botId } = await req.json()

    if (!botId) {
      return NextResponse.json({ error: 'Bot ID required' }, { status: 400 })
    }

    const supabase = createServerClient()

    // Get token to remove webhook
    const { data: integration } = await supabase
      .from('integrations')
      .select('access_token')
      .eq('provider', 'telegram')
      .filter('metadata->>bot_id', 'eq', botId)
      .single()

    if (integration?.access_token) {
      // Remove webhook from Telegram
      await fetch(`https://api.telegram.org/bot${integration.access_token}/deleteWebhook`)
    }

    // Delete from DB
    await supabase
      .from('integrations')
      .delete()
      .eq('provider', 'telegram')
      .filter('metadata->>bot_id', 'eq', botId)

    return NextResponse.json({ disconnected: true })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to disconnect' },
      { status: 500 }
    )
  }
}
