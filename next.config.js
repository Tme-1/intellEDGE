/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
})

const nextConfig = {
  webpack: (config, { isServer }) => {
    // Ignore the critical dependency warning for @supabase/realtime-js
    config.ignoreWarnings = [
      { module: /node_modules\/@supabase\/realtime-js/ }
    ]
    return config
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' https://accounts.google.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://generativelanguage.googleapis.com https://api.openweathermap.org https://*.googleapis.com https://www.googleapis.com https://accounts.google.com; worker-src 'self' blob:; child-src 'self' blob:; frame-src 'self' https://accounts.google.com;"
          }
        ]
      }
    ]
  }
}

module.exports = withPWA(nextConfig) 