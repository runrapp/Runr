# Web Research Skill

## Provider
Playwright (headless Chromium)

## Capabilities
- Browse any public URL and extract content
- Search the web via DuckDuckGo
- Summarize articles and web pages
- Extract structured data from pages

## Parameters
- `action`: browse | search
- `url`: target URL (for browse)
- `query`: search query (for search)

## Constraints
- Navigation, ads, and footer content automatically stripped
- Page load timeout: 15 seconds
- Content extraction limited to main body text
- No login-required pages (public only)
- JavaScript-rendered content is supported (Playwright waits for DOM)

## Processing
1. Navigate to URL or search engine
2. Wait for DOM content loaded
3. Strip non-content elements (nav, header, footer, aside, ads)
4. Extract text from main/article/body
5. Pass to Claude for summarization
