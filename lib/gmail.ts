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

export function getGmailAuthUrl(state?: string): string {
  const oauth2Client = getOAuth2Client()

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.modify',
    ],
    state: state || 'gmail',
    prompt: 'consent',
  })
}

export async function getTokensFromCode(code: string) {
  const oauth2Client = getOAuth2Client()
  const { tokens } = await oauth2Client.getToken(code)
  return tokens
}

export async function readEmails(accessToken: string, maxResults = 10) {
  const oauth2Client = getOAuth2Client()
  oauth2Client.setCredentials({ access_token: accessToken })

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client })

  const res = await gmail.users.messages.list({
    userId: 'me',
    maxResults,
    labelIds: ['INBOX'],
  })

  if (!res.data.messages || res.data.messages.length === 0) {
    return []
  }

  const emails = await Promise.all(
    res.data.messages.map(async (msg) => {
      const detail = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id!,
        format: 'metadata',
        metadataHeaders: ['From', 'Subject', 'Date'],
      })

      const headers = detail.data.payload?.headers || []
      const getHeader = (name: string) =>
        headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value || ''

      return {
        id: msg.id,
        from: getHeader('From'),
        subject: getHeader('Subject'),
        date: getHeader('Date'),
        snippet: detail.data.snippet || '',
      }
    })
  )

  return emails
}

export async function sendEmail(
  accessToken: string,
  to: string,
  subject: string,
  body: string
) {
  const oauth2Client = getOAuth2Client()
  oauth2Client.setCredentials({ access_token: accessToken })

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client })

  const raw = Buffer.from(
    `To: ${to}\r\n` +
    `Subject: ${subject}\r\n` +
    `Content-Type: text/plain; charset=utf-8\r\n\r\n` +
    body
  ).toString('base64url')

  const res = await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw },
  })

  return res.data
}

export async function getEmailBody(accessToken: string, messageId: string) {
  const oauth2Client = getOAuth2Client()
  oauth2Client.setCredentials({ access_token: accessToken })

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client })

  const res = await gmail.users.messages.get({
    userId: 'me',
    id: messageId,
    format: 'full',
  })

  const parts = res.data.payload?.parts || []
  let bodyData = ''

  // Try to get text/plain part
  for (const part of parts) {
    if (part.mimeType === 'text/plain' && part.body?.data) {
      bodyData = Buffer.from(part.body.data, 'base64url').toString('utf-8')
      break
    }
  }

  // Fallback to payload body
  if (!bodyData && res.data.payload?.body?.data) {
    bodyData = Buffer.from(res.data.payload.body.data, 'base64url').toString('utf-8')
  }

  // Truncate to 500 words as per skill definition
  const words = bodyData.split(/\s+/)
  if (words.length > 500) {
    bodyData = words.slice(0, 500).join(' ') + '... [truncated]'
  }

  return bodyData
}
