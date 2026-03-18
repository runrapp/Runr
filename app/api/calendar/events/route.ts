import { NextRequest, NextResponse } from 'next/server'
import { listEvents, createEvent } from '@/lib/calendar'

export async function GET(req: NextRequest) {
  const accessToken = req.cookies.get('calendar_access_token')?.value

  if (!accessToken) {
    return NextResponse.json(
      { error: 'Google Calendar not connected. Visit /api/calendar/connect to authorize.' },
      { status: 401 }
    )
  }

  try {
    const days = Number(new URL(req.url).searchParams.get('days')) || 7
    const events = await listEvents(accessToken, days)

    return NextResponse.json({
      count: events.length,
      events,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to list events'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const accessToken = req.cookies.get('calendar_access_token')?.value

  if (!accessToken) {
    return NextResponse.json(
      { error: 'Google Calendar not connected.' },
      { status: 401 }
    )
  }

  try {
    const body = await req.json()
    const { summary, description, start, end, location, attendees } = body

    if (!summary || !start || !end) {
      return NextResponse.json(
        { error: 'Missing required fields: summary, start, end' },
        { status: 400 }
      )
    }

    const event = await createEvent(accessToken, {
      summary,
      description,
      start,
      end,
      location,
      attendees,
    })

    return NextResponse.json(event)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create event'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
