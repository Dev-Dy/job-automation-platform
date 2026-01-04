import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Job Automation Platform',
  description: 'LLM-powered job opportunity automation',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
