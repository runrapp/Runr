import { NextResponse } from 'next/server'
import { getGmailAuthUrl } from '@/lib/gmail'

export async function GET() {
  try {
    const authUrl = getGmailAuthUrl('gmail')
    return NextResponse.redirect(authUrl)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to generate Gmail auth URL'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
