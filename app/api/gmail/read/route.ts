import { NextRequest, NextResponse } from 'next/server'
import { readEmails } from '@/lib/gmail'

export async function GET(req: NextRequest) {
  const accessToken = req.cookies.get('gmail_access_token')?.value

  if (!accessToken) {
    return NextResponse.json(
      { error: 'Gmail not connected. Visit /api/gmail/connect to authorize.' },
      { status: 401 }
    )
  }

  try {
    const maxResults = Number(new URL(req.url).searchParams.get('limit')) || 10
    const emails = await readEmails(accessToken, maxResults)

    return NextResponse.json({
      count: emails.length,
      emails,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to read emails'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
