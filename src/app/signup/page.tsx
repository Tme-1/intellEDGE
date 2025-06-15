'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { motion } from 'framer-motion'

export default function SignUp() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const validatePassword = (pass: string) => {
    const hasLetter = /[a-zA-Z]/.test(pass)
    const hasNumber = /[0-9]/.test(pass)
    return hasLetter && hasNumber && pass.length >= 8
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!fullName.trim() || !username.trim()) {
      setError('Full name and public username are required.')
      setLoading(false)
      return
    }

    if (!validatePassword(password)) {
      setError('Password must be at least 8 characters long and include both letters and numbers.')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      setLoading(false)
      return
    }

    try {
      // Check if we're using dummy credentials
      if (process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://dummy.supabase.co') {
        throw new Error('Authentication service is not properly configured. Please try again later.')
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            username: username,
          },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      })

      if (error) throw error

      router.push('/login?message=Check your email to confirm your account')
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
            Get<br />started<br /><span className="text-cyan-300">with IntellEDGE</span>
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
            <span
              className="flex-1 text-center py-2 text-[16px] font-medium text-edx-blue border-b-2 border-edx-light-blue cursor-default"
            >
              Register
            </span>
            <Link
              href="/login"
              className="flex-1 text-center py-2 text-[16px] font-medium text-edx-blue hover:text-edx-light-blue transition-colors border-b-2 border-transparent"
            >
              Sign in
            </Link>
          </div>

          <form className="space-y-6" onSubmit={handleSignUp}>
            <div className="relative mb-4">
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                className="w-full h-[40px] px-3 border border-gray-300 rounded-xl text-black focus:outline-none focus:border-2 focus:border-edx-light-blue transition-all duration-300 peer bg-transparent"
                placeholder=" "
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              <label
                htmlFor="fullName"
                className={`absolute left-3 transition-all duration-200 pointer-events-none px-1
                  text-gray-400 text-[14px]
                  peer-focus:-top-3 peer-focus:text-xs peer-focus:text-edx-light-blue peer-focus:font-medium peer-focus:bg-white
                  ${fullName ? '-top-3 text-xs text-edx-light-blue font-medium bg-white' : 'top-2'}`}
              >
                Full Name
              </label>
            </div>
            <div className="relative mb-4">
              <input
                id="username"
                name="username"
                type="text"
                required
                className="w-full h-[40px] px-3 border border-gray-300 rounded-xl text-black focus:outline-none focus:border-2 focus:border-edx-light-blue transition-all duration-300 peer bg-transparent"
                placeholder=" "
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <label
                htmlFor="username"
                className={`absolute left-3 transition-all duration-200 pointer-events-none px-1
                  text-gray-400 text-[14px]
                  peer-focus:-top-3 peer-focus:text-xs peer-focus:text-edx-light-blue peer-focus:font-medium peer-focus:bg-white
                  ${username ? '-top-3 text-xs text-edx-light-blue font-medium bg-white' : 'top-2'}`}
              >
                Public Username
              </label>
            </div>
            <div className="relative mb-4">
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full h-[40px] px-3 border border-gray-300 rounded-xl text-black focus:outline-none focus:border-2 focus:border-edx-light-blue transition-all duration-300 peer bg-transparent"
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
                className="w-full h-[40px] px-3 border border-gray-300 rounded-xl text-black focus:outline-none focus:border-2 focus:border-edx-light-blue transition-all duration-300 peer bg-transparent"
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
              <p className="mt-1 text-[12px] text-gray-500">
              Password must be at least 8 characters long and include both letters and numbers
            </p>
            <div className="relative mb-4">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                className="w-full h-[40px] px-3 border border-gray-300 rounded-xl text-black focus:outline-none focus:border-2 focus:border-edx-light-blue transition-all duration-300 peer bg-transparent"
                placeholder=" "
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <label
                htmlFor="confirmPassword"
                className={`absolute left-3 transition-all duration-200 pointer-events-none px-1
                  text-gray-400 text-[14px]
                  peer-focus:-top-3 peer-focus:text-xs peer-focus:text-edx-light-blue peer-focus:font-medium peer-focus:bg-white
                  ${confirmPassword ? '-top-3 text-xs text-edx-light-blue font-medium bg-white' : 'top-2'}`}
              >
                Confirm Password
              </label>
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none transition-colors duration-300"
              >
                {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>

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
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </div>

            <div className="text-center text-[12px] text-gray-600">
              By signing up, you agree to our{' '}
              <Link href="/terms" className="text-edx-light-blue hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-edx-light-blue hover:underline">
                Privacy Policy
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 