import { NextRequest, NextResponse } from 'next/server'
import { getTokensFromCode as getGmailTokens } from '@/lib/gmail'
import { getTokensFromCode as getCalendarTokens } from '@/lib/calendar'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state') || 'gmail'
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(
      new URL(`/dashboard/integrations?error=${encodeURIComponent(error)}`, req.url)
    )
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/dashboard/integrations?error=no_code', req.url)
    )
  }

  try {
    let tokens
    if (state === 'calendar') {
      tokens = await getCalendarTokens(code)
    } else {
      tokens = await getGmailTokens(code)
    }

    // In production, store tokens in Supabase associated with user
    // For now, redirect with success indicator
    const redirectUrl = new URL('/dashboard/integrations', req.url)
    redirectUrl.searchParams.set('connected', state)
    redirectUrl.searchParams.set('success', 'true')

    // Set tokens in httpOnly cookie for session use
    const response = NextResponse.redirect(redirectUrl)
    if (tokens.access_token) {
      response.cookies.set(`${state}_access_token`, tokens.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 3600, // 1 hour
        path: '/',
      })
    }
    if (tokens.refresh_token) {
      response.cookies.set(`${state}_refresh_token`, tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 3600, // 30 days
        path: '/',
      })
    }

    return response
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Token exchange failed'
    return NextResponse.redirect(
      new URL(`/dashboard/integrations?error=${encodeURIComponent(message)}`, req.url)
    )
  }
}
