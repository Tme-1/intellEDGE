'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import CgpaCalculator from './cgpa-calculator'
import ELibrary from './e-library'
import AiTeachingBot from './ai-teaching-bot'
import Profile from './profile'
import WeatherWidget from "@/components/WeatherWidget"
import { FiHome, FiPercent, FiBook, FiCpu, FiUser, FiLogOut, FiMenu, FiX, FiClock, FiEdit3 } from 'react-icons/fi'
import QuizPage from '@/components/QuizPage'
import Link from 'next/link'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState<string>("")
  const [activeSection, setActiveSection] = useState<'welcome' | 'cgpa' | 'elibrary' | 'ai' | 'profile' | 'quiz'>('welcome')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [examDate, setExamDate] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<{days: number, hours: number, minutes: number, seconds: number} | null>(null);

  useEffect(() => {
    // Skip authentication during build time
    if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
      setLoading(false);
      return;
    }

    const checkUser = async () => {
      try {
        // Skip authentication if we're using dummy credentials
        if (process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://dummy.supabase.co') {
          setLoading(false);
          return;
        }

        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          router.push('/login');
          return;
        }

        if (!session) {
          router.push('/login');
          return;
        }

        // Get the user from the session
        const { data: { user }, error: userError } = await supabase.auth.getUser(session.access_token);
        
        if (userError) {
          console.error('Error getting user:', userError);
          router.push('/login');
          return;
        }

        if (!user) {
          router.push('/login');
          return;
        }

        setUser(user);
        setToken(session.access_token);

        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'SIGNED_OUT') {
            router.push('/login');
          } else if (session) {
            setUser(session.user);
            setToken(session.access_token);
          }
        });

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error checking user:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [router]);

  // Fetch exam date after token is set
  useEffect(() => {
    if (!token) return;
    const fetchExamDate = async () => {
      const res = await fetch("/api/profile", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok && data.profile?.examDate) {
        setExamDate(data.profile.examDate);
      } else {
        setExamDate(null);
      }
    };
    fetchExamDate();
  }, [token, activeSection]);

  // Countdown logic
  useEffect(() => {
    if (!examDate) return;
    const interval = setInterval(() => {
      const now = new Date();
      const target = new Date(examDate);
      const diff = target.getTime() - now.getTime();
      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(interval);
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setCountdown({ days, hours, minutes, seconds });
    }, 1000);
    return () => clearInterval(interval);
  }, [examDate]);

  const handleSignOut = async () => {
    try {
      if (!supabase) {
        console.warn('Supabase client not initialized');
        return;
      }
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl text-gray-700">Loading Dashboard...</div>
      </div>
    )
  }

  const navItems = [
    { id: 'welcome', label: 'Home', icon: FiHome },
    { id: 'cgpa', label: 'CGPA Calculator', icon: FiPercent },
    { id: 'elibrary', label: 'E-Library', icon: FiBook },
    { id: 'ai', label: 'AI Teaching Bot', icon: FiCpu },
    { id: 'quiz', label: 'Take a quiz', icon: FiEdit3 },
    { id: 'profile', label: 'Profile', icon: FiUser },
  ]

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside 
        className={`bg-gradient-to-b from-blue-500 via-blue-500 to-gray-100 border-r border-white/20 backdrop-blur-xl text-white flex flex-col p-2 sm:p-4 shadow-2xl transition-all duration-300 ease-in-out fixed top-0 left-0 h-full z-30 ${sidebarOpen ? 'w-56 sm:w-64' : 'w-14 sm:w-20'}`}
        style={{ minHeight: '100vh' }}
      >
        <div className={`flex items-center mb-6 px-2 py-3 border-b border-gray-700 ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
          {sidebarOpen && (
            <span className="text-2xl font-semibold">IntellEDGE</span>
          )}
              <button
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            className="text-gray-300 hover:text-white focus:outline-none p-1 rounded-md hover:bg-gray-700"
            title={sidebarOpen ? "Close Sidebar" : "Open Sidebar"}
              >
            {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
        </div>

        <nav className="flex-grow space-y-2">
          {navItems.map((item) => (
              <button
              key={item.id}
              onClick={() => {
                setActiveSection(item.id as any)
                if (window.innerWidth < 768 && sidebarOpen) {
                    setSidebarOpen(false);
                }
              }}
              title={!sidebarOpen ? item.label : ''}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors duration-150 group
                ${
                  activeSection === item.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }
                ${!sidebarOpen && 'justify-center'}`
              }
              >
              <item.icon className={`h-5 w-5 font-bold ${sidebarOpen ? '' : 'mr-0'}`} />
              {sidebarOpen && <span className="font-bold">{item.label}</span>}
              {!sidebarOpen && (
                <span className="absolute left-full ml-2 px-2 py-1 bg-gray-700 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                  {item.label}
                </span>
              )}
              </button>
          ))}
        </nav>

        <div className={`mt-auto pt-4 border-t border-gray-700 ${!sidebarOpen && 'space-y-2'}`}>
          {user?.email && sidebarOpen && (
            <div className="px-3 py-2 text-xs text-black truncate mb-2" title={user.email}>
              {user.email}
            </div>
          )}
              <button
                onClick={handleSignOut}
            title={!sidebarOpen ? "Sign Out" : ''}
            className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-colors duration-150 shadow-md hover:shadow-lg
            ${!sidebarOpen && 'justify-center'}`
            }
          >
            <FiLogOut className={`h-5 w-5 ${sidebarOpen ? '' : 'mr-0'}`} />
            {sidebarOpen && <span>Sign out</span>}
            {!sidebarOpen && (
              <span className="absolute left-full ml-2 px-2 py-1 bg-gray-700 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                Sign out
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content Area - overlay for mobile when sidebar is open */}
      {sidebarOpen && window.innerWidth < 768 && (
          <div 
            onClick={() => setSidebarOpen(false)} 
            className="fixed inset-0 bg-black/30 z-10 md:hidden"
          ></div>
      )}
      <main className={`flex-1 p-2 sm:p-6 lg:p-10 overflow-y-auto transition-all duration-300 ease-in-out ml-14 sm:ml-20 md:ml-64`}>
        <div className="max-w-4xl mx-auto">
          {activeSection === 'welcome' && (
            <>
              <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8 mb-8 w-full">
                <div className="flex flex-col md:flex-row items-center justify-between w-full gap-6">
                  <div className="flex-1 min-w-0 text-left bg-white rounded-xl p-6 shadow-md w-full">
                    {user?.user_metadata?.username && (
                      <div className="text-3xl font-bold text-gray-800 mb-2 break-words whitespace-normal">Hi, {user.user_metadata.username}!</div>
                    )}
                    <h2 className="text-3xl font-bold text-gray-900 mb-4 break-words whitespace-normal">Welcome to your Dashboard</h2>
                    <p className="text-gray-600 text-lg break-words whitespace-normal">
                      This is your central hub for managing study materials, tracking academic progress, and utilizing AI-powered learning tools.
                    </p>
                  </div>
                  <div className="flex-shrink-0 w-full md:w-auto md:ml-8 mt-6 md:mt-0 flex justify-center">
                    <div className="w-full md:w-[300px]">
                      <WeatherWidget />
                    </div>
                  </div>
                </div>
                {!examDate && (
                  <Link href="/dashboard?section=profile" className="w-full p-6 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-xl border-2 border-white/30 relative overflow-hidden animate-fade-in flex flex-col items-center justify-center px-4 mt-8 break-words whitespace-normal text-white text-lg font-semibold text-center">
                    Log your exam date to start your exam countdown.
                  </Link>
                )}
                {examDate && countdown && (
                  <div className="w-full p-6 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-xl border-2 border-white/30 relative overflow-hidden animate-fade-in flex flex-col items-center justify-center px-4 mt-8 break-words whitespace-normal">
                    <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'}}></div>
                    <FiClock className="w-10 h-10 text-white mb-2 drop-shadow-lg animate-pulse z-10" />
                    <div className="text-lg font-bold text-white mb-2 tracking-wide drop-shadow z-10 break-words whitespace-normal">Exam Countdown</div>
                    <div className="text-sm sm:text-base font-medium text-white/80 mb-2 z-10 break-words whitespace-normal">You have <span className="font-bold text-white">{countdown.days}</span> day{countdown.days !== 1 ? 's' : ''} left until your exam, make the most of the time you still have.</div>
                    <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-white tracking-widest font-mono flex gap-1 sm:gap-2 animate-timer z-10 break-words whitespace-normal">
                      <span className="transition-all duration-200">{String(countdown.days).padStart(2, '0')}</span><span className="opacity-70">d</span> :
                      <span className="transition-all duration-200">{String(countdown.hours).padStart(2, '0')}</span><span className="opacity-70">h</span> :
                      <span className="transition-all duration-200">{String(countdown.minutes).padStart(2, '0')}</span><span className="opacity-70">m</span> :
                      <span className="transition-all duration-200">{String(countdown.seconds).padStart(2, '0')}</span><span className="opacity-70">s</span>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
          
          {activeSection === 'cgpa' && <CgpaCalculator token={token} />}
          {activeSection === 'elibrary' && <ELibrary token={token} />}
          {activeSection === 'ai' && <AiTeachingBot token={token} />}
          {activeSection === 'quiz' && <QuizPage token={token} />}
          {activeSection === 'profile' && <Profile token={token} />}
        </div>
      </main>
    </div>
  )
} 