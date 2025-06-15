'use client'

import { useState, Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { motion } from 'framer-motion'

function Login() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const message = searchParams?.get('message')

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/dashboard')
      }
    }
    checkSession()
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Set persistent session
      if (data.session) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        })
      }

      router.push('/dashboard')
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row">
      {/* Top image for mobile, left for desktop */}
      <div className="w-full md:w-1/2 relative items-center justify-center overflow-hidden min-h-[220px] md:min-h-0 flex"
        style={{ backgroundImage: "url('/library-bg.jpg')", backgroundSize: 'cover', backgroundPosition: 'center', height: 'auto' }}>
        <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.3)' }} />
        <div className="absolute top-1/2 left-[40%] -translate-y-1/2 z-10 flex flex-col items-start w-[60%] min-w-[220px] max-w-[400px]">
          <motion.div 
            className="absolute -left-8 top-1/2 -translate-y-1/2 rotate-[15deg] w-2 h-20 md:h-32 bg-orange-400 z-0"
            initial={{ opacity: 0, x: -100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
          <motion.h2 
            className="text-white text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold mb-2 z-10 leading-tight"
            initial={{ opacity: 0, x: -200 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            Welcome<br />back to<br /><span className="text-cyan-300">IntellEDGE</span>
          </motion.h2>
          <motion.div 
            className="w-8 md:w-12 h-1 bg-cyan-400 mt-4 md:mt-6 mb-2"
            initial={{ opacity: 0, x: -100, width: 0 }}
            animate={{ opacity: 1, x: 0, width: 32 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </div>
      </div>
      {/* Right form section */}
      <div className="flex flex-1 items-start md:items-center justify-center bg-edx-gray min-h-screen w-full pt-4 md:pt-0">
        <div className="max-w-[400px] w-full bg-white/80 backdrop-blur-sm p-4 sm:p-8 rounded-2xl shadow-[0_8px_32px_0_rgba(0,97,155,0.15)] border border-white/20 transition-all duration-300 hover:shadow-[0_12px_48px_0_rgba(0,97,155,0.25)]">
          {/* Tab Bar */}
          <div className="flex border-b border-gray-200 mb-8">
            <Link
              href="/signup"
              className="flex-1 text-center py-2 text-[16px] font-medium text-edx-blue hover:text-edx-light-blue transition-colors border-b-2 border-transparent"
            >
              Register
            </Link>
            <span
              className="flex-1 text-center py-2 text-[16px] font-medium text-edx-blue border-b-2 border-edx-light-blue cursor-default"
            >
              Sign in
            </span>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="relative mb-4">
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full h-[40px] px-3 border border-gray-300 rounded-xl text-[14px] text-black focus:outline-none focus:border-2 focus:border-edx-light-blue transition-all duration-300 peer bg-transparent"
                placeholder=" "
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <label
                htmlFor="email"
                className={`absolute left-3 transition-all duration-200 pointer-events-none px-1
                  text-gray-400 text-[14px]
                  peer-focus:-top-3 peer-focus:text-xs peer-focus:text-edx-light-blue peer-focus:font-medium peer-focus:bg-white
                  ${email ? '-top-3 text-xs text-edx-light-blue font-medium bg-white' : 'top-2'}`}
              >
                Email
              </label>
            </div>

            <div className="relative mb-4">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                className="w-full h-[40px] px-3 border border-gray-300 rounded-xl text-[14px] text-black focus:outline-none focus:border-2 focus:border-edx-light-blue transition-all duration-300 peer bg-transparent"
                placeholder=" "
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <label
                htmlFor="password"
                className={`absolute left-3 transition-all duration-200 pointer-events-none px-1
                  text-gray-400 text-[14px]
                  peer-focus:-top-3 peer-focus:text-xs peer-focus:text-edx-light-blue peer-focus:font-medium peer-focus:bg-white
                  ${password ? '-top-3 text-xs text-edx-light-blue font-medium bg-white' : 'top-2'}`}
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none transition-colors duration-300"
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>

            <div className="flex items-center justify-end mt-1">
              <Link href="/forgot-password" className="text-[12px] text-edx-light-blue hover:underline transition-colors duration-300">
                Forgot password?
              </Link>
            </div>

            {message && (
              <div className="text-[14px] text-green-600 bg-green-50 p-3 rounded-xl transition-all duration-300 hover:shadow-[0_4px_12px_0_rgba(34,197,94,0.15)]">
                {message}
              </div>
            )}

            {error && (
              <div className="text-[14px] text-red-600 bg-red-50 p-3 rounded-xl transition-all duration-300 hover:shadow-[0_4px_12px_0_rgba(239,68,68,0.15)]">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full h-[40px] bg-edx-light-blue text-white text-[14px] font-medium rounded-xl hover:bg-[#00619B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-edx-light-blue disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-[0_4px_12px_0_rgba(0,97,155,0.25)]"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>

            <div className="text-center text-[12px] text-gray-600">
              By signing in, you agree to our{' '}
              <Link href="/terms" className="text-edx-light-blue hover:underline transition-colors duration-300">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-edx-light-blue hover:underline transition-colors duration-300">
                Privacy Policy
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Login />
    </Suspense>
  );
} 