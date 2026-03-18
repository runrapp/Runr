import { NextResponse } from 'next/server'
import { getCalendarAuthUrl } from '@/lib/calendar'

export async function GET() {
  try {
    const authUrl = getCalendarAuthUrl('calendar')
    return NextResponse.redirect(authUrl)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to generate Calendar auth URL'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
