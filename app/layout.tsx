import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Runr — Do less. Run more.',
  description: 'Your AI agent. Always on. Manages email, calendar, web research, Telegram, and Discord — 24/7 without manual intervention.',
  openGraph: {
    title: 'Runr — Do less. Run more.',
    description: 'Your AI agent. Always on.',
    url: 'https://runr.site',
    siteName: 'Runr',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-white text-ink antialiased">
        {children}
      </body>
    </html>
  )
}
