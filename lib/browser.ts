import { chromium, type Browser } from 'playwright-core'

let browserInstance: Browser | null = null

async function getBrowser(): Promise<Browser> {
  if (browserInstance && browserInstance.isConnected()) {
    return browserInstance
  }

  browserInstance = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  })

  return browserInstance
}

export async function browseUrl(url: string): Promise<string> {
  // Ensure URL has protocol
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`
  }

  const browser = await getBrowser()
  const page = await browser.newPage({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  })

  try {
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 15000,
    })

    // Extract main body content — strip nav, ads, footers
    const content = await page.evaluate(() => {
      // Remove unwanted elements
      const selectors = [
        'nav', 'header', 'footer', 'aside',
        '[role="navigation"]', '[role="banner"]', '[role="contentinfo"]',
        '.nav', '.header', '.footer', '.sidebar', '.ad', '.ads', '.advertisement',
        'script', 'style', 'noscript', 'iframe',
      ]

      selectors.forEach((sel) => {
        document.querySelectorAll(sel).forEach((el) => el.remove())
      })

      // Get main content
      const main = document.querySelector('main') ||
                   document.querySelector('article') ||
                   document.querySelector('[role="main"]') ||
                   document.body

      const text = main?.innerText || document.body.innerText || ''

      // Clean up whitespace
      return text
        .split('\n')
        .map((line: string) => line.trim())
        .filter((line: string) => line.length > 0)
        .join('\n')
    })

    const title = await page.title()

    return `Title: ${title}\nURL: ${url}\n\n${content}`
  } catch (err) {
    throw new Error(`Failed to browse ${url}: ${err instanceof Error ? err.message : 'Unknown error'}`)
  } finally {
    await page.close()
  }
}

export async function searchWeb(query: string): Promise<string> {
  // Use DuckDuckGo HTML for simple web search
  const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`

  const browser = await getBrowser()
  const page = await browser.newPage()

  try {
    await page.goto(searchUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 15000,
    })

    const results = await page.evaluate(() => {
      const items = document.querySelectorAll('.result')
      const output: string[] = []

      items.forEach((item, i) => {
        if (i >= 5) return
        const title = item.querySelector('.result__title')?.textContent?.trim() || ''
        const snippet = item.querySelector('.result__snippet')?.textContent?.trim() || ''
        const link = item.querySelector('.result__url')?.textContent?.trim() || ''
        if (title) {
          output.push(`${i + 1}. ${title}\n   ${link}\n   ${snippet}`)
        }
      })

      return output.join('\n\n')
    })

    return `Search results for "${query}":\n\n${results}`
  } catch (err) {
    throw new Error(`Search failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
  } finally {
    await page.close()
  }
}

export async function closeBrowser() {
  if (browserInstance) {
    await browserInstance.close()
    browserInstance = null
  }
}
