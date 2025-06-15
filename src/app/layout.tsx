import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { createClient } from '@supabase/supabase-js'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'IntellEDGE',
  description: 'A comprehensive study management platform for university students',
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' }
    ],
    apple: '/icons/icon-192x192.png',
  },
}

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3b82f6" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icons/icon-512x512.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Check for existing session on app load
              (async function() {
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                  // If we're on the login or signup page, redirect to dashboard
                  if (window.location.pathname === '/login' || window.location.pathname === '/signup') {
                    window.location.href = '/dashboard';
                  }
                }
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
} 