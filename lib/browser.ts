// Fetch-based web browsing — works on Vercel (no Playwright needed)

export async function browseUrl(url: string): Promise<string> {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`
  }

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; Runr/1.0; +https://runr.site)',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
    signal: AbortSignal.timeout(15000),
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`)
  }

  const html = await res.text()

  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
  const title = titleMatch ? titleMatch[1].trim() : 'No title'

  const content = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/<[^>]+>/g, '\n')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .split('\n')
    .map((line: string) => line.trim())
    .filter((line: string) => line.length > 0)
    .join('\n')

  const truncated = content.length > 3000 ? content.substring(0, 3000) + '... [truncated]' : content

  return `Title: ${title}\nURL: ${url}\n\n${truncated}`
}

export async function searchWeb(query: string): Promise<string> {
  const searchUrl = `https://lite.duckduckgo.com/lite/?q=${encodeURIComponent(query)}`

  const res = await fetch(searchUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; Runr/1.0; +https://runr.site)',
    },
    signal: AbortSignal.timeout(15000),
  })

  const html = await res.text()

  const results: string[] = []
  const linkRegex = /<a[^>]*class="result-link"[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi
  const snippetRegex = /<td class="result-snippet">([\s\S]*?)<\/td>/gi

  const links: { url: string; title: string }[] = []
  let match

  while ((match = linkRegex.exec(html)) !== null) {
    links.push({
      url: match[1].replace(/&amp;/g, '&'),
      title: match[2].replace(/<[^>]+>/g, '').trim(),
    })
  }

  const snippets: string[] = []
  while ((match = snippetRegex.exec(html)) !== null) {
    snippets.push(match[1].replace(/<[^>]+>/g, '').trim())
  }

  for (let i = 0; i < Math.min(links.length, 5); i++) {
    results.push(`${i + 1}. ${links[i].title}\n   ${links[i].url}\n   ${snippets[i] || ''}`)
  }

  if (results.length === 0) {
    const anyLinkRegex = /<a[^>]*href="(https?:\/\/[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi
    let count = 0
    while ((match = anyLinkRegex.exec(html)) !== null && count < 5) {
      const linkTitle = match[2].replace(/<[^>]+>/g, '').trim()
      if (linkTitle && linkTitle.length > 5 && !match[1].includes('duckduckgo')) {
        results.push(`${count + 1}. ${linkTitle}\n   ${match[1]}`)
        count++
      }
    }
  }

  return results.length > 0
    ? `Search results for "${query}":\n\n${results.join('\n\n')}`
    : `No results found for "${query}". Try a different search term.`
}
