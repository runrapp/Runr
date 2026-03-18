import { NextRequest, NextResponse } from 'next/server'
import { browseUrl, searchWeb } from '@/lib/browser'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { url, query, action } = body

    if (action === 'search' && query) {
      const results = await searchWeb(query)
      return NextResponse.json({
        type: 'search',
        query,
        results,
      })
    }

    if (url) {
      const content = await browseUrl(url)
      return NextResponse.json({
        type: 'browse',
        url,
        content,
      })
    }

    return NextResponse.json(
      { error: 'Provide either a URL to browse or a query to search.' },
      { status: 400 }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Browse failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'Browse API active',
    usage: {
      browse: 'POST with { url: "https://example.com" }',
      search: 'POST with { action: "search", query: "your search" }',
    },
  })
}
