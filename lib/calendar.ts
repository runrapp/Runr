import { google } from 'googleapis'

function getOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback'

  if (!clientId || !clientSecret) {
    throw new Error('Missing Google OAuth credentials. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.')
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri)
}

export function getCalendarAuthUrl(state?: string): string {
  const oauth2Client = getOAuth2Client()

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/calendar.events',
    ],
    state: state || 'calendar',
    prompt: 'consent',
  })
}

export async function getTokensFromCode(code: string) {
  const oauth2Client = getOAuth2Client()
  const { tokens } = await oauth2Client.getToken(code)
  return tokens
}

export async function listEvents(accessToken: string, days = 7) {
  const oauth2Client = getOAuth2Client()
  oauth2Client.setCredentials({ access_token: accessToken })

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

  const now = new Date()
  const future = new Date()
  future.setDate(future.getDate() + days)

  const res = await calendar.events.list({
    calendarId: 'primary',
    timeMin: now.toISOString(),
    timeMax: future.toISOString(),
    maxResults: 20,
    singleEvents: true,
    orderBy: 'startTime',
  })

  return (res.data.items || []).map((event) => ({
    id: event.id,
    summary: event.summary || 'Untitled event',
    start: event.start?.dateTime || event.start?.date || '',
    end: event.end?.dateTime || event.end?.date || '',
    location: event.location || null,
    attendees: (event.attendees || []).map((a) => a.email).filter(Boolean),
    status: event.status,
  }))
}

export async function createEvent(
  accessToken: string,
  eventData: {
    summary: string
    description?: string
    start: string
    end: string
    location?: string
    attendees?: string[]
  }
) {
  const oauth2Client = getOAuth2Client()
  oauth2Client.setCredentials({ access_token: accessToken })

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

  const event = {
    summary: eventData.summary,
    description: eventData.description || '',
    location: eventData.location || '',
    start: {
      dateTime: eventData.start,
      timeZone: 'UTC',
    },
    end: {
      dateTime: eventData.end,
      timeZone: 'UTC',
    },
    attendees: (eventData.attendees || []).map((email) => ({ email })),
  }

  const res = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: event,
    sendUpdates: 'all',
  })

  return {
    id: res.data.id,
    summary: res.data.summary,
    start: res.data.start,
    end: res.data.end,
    htmlLink: res.data.htmlLink,
  }
}

export async function deleteEvent(accessToken: string, eventId: string) {
  const oauth2Client = getOAuth2Client()
  oauth2Client.setCredentials({ access_token: accessToken })

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

  await calendar.events.delete({
    calendarId: 'primary',
    eventId,
  })

  return { deleted: true, eventId }
}

export async function updateEvent(
  accessToken: string,
  eventId: string,
  updates: {
    summary?: string
    description?: string
    start?: string
    end?: string
    location?: string
  }
) {
  const oauth2Client = getOAuth2Client()
  oauth2Client.setCredentials({ access_token: accessToken })

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

  const requestBody: Record<string, unknown> = {}
  if (updates.summary) requestBody.summary = updates.summary
  if (updates.description) requestBody.description = updates.description
  if (updates.location) requestBody.location = updates.location
  if (updates.start) requestBody.start = { dateTime: updates.start, timeZone: 'UTC' }
  if (updates.end) requestBody.end = { dateTime: updates.end, timeZone: 'UTC' }

  const res = await calendar.events.patch({
    calendarId: 'primary',
    eventId,
    requestBody,
  })

  return {
    id: res.data.id,
    summary: res.data.summary,
    start: res.data.start,
    end: res.data.end,
  }
}
