import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function generateNonce() {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export function middleware(request: NextRequest) {
  const nonce = generateNonce()
  const response = NextResponse.next()

  // Add nonce to response headers
  response.headers.set('x-nonce', nonce)

  return response
}

export const config = {
  matcher: '/:path*',
} 