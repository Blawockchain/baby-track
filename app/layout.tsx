import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TRACKR — Visual Tracking Effects',
  description: 'TRACKR — Real-time visual tracking effects tool',
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
