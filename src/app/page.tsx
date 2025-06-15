'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { FiMessageSquare, FiBook, FiFileText, FiTrendingUp, FiLayout, FiClock } from 'react-icons/fi'
import { AnimatedSection } from '@/components/ui/animated-section'

export default function LandingPage() {
  return (
    <div className="w-full font-sans min-h-screen bg-background">
      {/* Navigation Bar */}
      <nav className="flex flex-col sm:flex-row justify-between items-center p-4 sm:p-6 shadow-md bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <h1 className="text-xl sm:text-2xl font-bold text-text">IntellEDGE</h1>
        <div className="space-x-2 sm:space-x-6 mt-2 sm:mt-0 flex flex-wrap justify-center">
          <a href="#features" className="text-text hover:text-primary text-sm sm:text-base">Features</a>
          <a href="#about" className="text-text hover:text-primary text-sm sm:text-base">About</a>
          <a href="#faq" className="text-text hover:text-primary text-sm sm:text-base">FAQ</a>
          <Link href="/signup">
            <Button size="sm" className="text-sm sm:text-base">Get Started</Button>
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-8 sm:py-12 space-y-8 sm:space-y-12">
        {/* Hero Section */}
        <AnimatedSection className="text-center py-12 sm:py-20" accentColor="blue">
          <h2 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-4 text-text">Your All-in-One Study Companion</h2>
          <p className="text-base sm:text-lg text-black max-w-xl mx-auto mb-4 sm:mb-6">
            Master your academics with AI-powered tools, an organized eLibrary, and everything you need in one place.
          </p>
          <Link href="/signup">
            <Button size="lg">Get Started – It's Free</Button>
          </Link>
        </AnimatedSection>

        {/* Features Section */}
        <AnimatedSection id="features" className="py-8 sm:py-16 text-center" accentColor="cyan">
          <h3 className="text-xl sm:text-3xl font-semibold mb-6 sm:mb-12 text-text">What You Get with IntellEDGE</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8 max-w-6xl mx-auto">
            {[
              { 
                title: "AI Teaching Bot", 
                desc: "Get instant answers to study-related questions.",
                icon: <FiMessageSquare className="w-8 h-8 mx-auto mb-4 text-primary" />
              },
              { 
                title: "E-Library", 
                desc: "Quickly find and download lecture notes and textbooks.",
                icon: <FiBook className="w-8 h-8 mx-auto mb-4 text-primary" />
              },
              { 
                title: "Quiz Practice", 
                desc: "Practice past questions and test your knowledge.",
                icon: <FiFileText className="w-8 h-8 mx-auto mb-4 text-primary" />
              },
              { 
                title: "CGPA Calculator", 
                desc: "Easily track your academic progress.",
                icon: <FiTrendingUp className="w-8 h-8 mx-auto mb-4 text-primary" />
              },
              {
                title: "Exam Countdown",
                desc: "Set a timer to know exactly how much time you have to prepare for your exam.",
                icon: <FiClock className="w-8 h-8 mx-auto mb-4 text-primary" />
              },
              { 
                title: "Dashboard", 
                desc: "All your details and tools in one hub.",
                icon: <FiLayout className="w-8 h-8 mx-auto mb-4 text-primary" />
              },
            ].map((feature, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white/50 backdrop-blur-sm border border-transparent shadow-sm hover:shadow-md transition-shadow">
                {feature.icon}
                <h4 className="text-xl font-bold mb-2 text-text">{feature.title}</h4>
                <p className="text-black">{feature.desc}</p>
              </div>
            ))}
          </div>
        </AnimatedSection>

        {/* About Section */}
        <AnimatedSection id="about" className="py-20 text-center" accentColor="purple">
          <h3 className="text-3xl font-semibold mb-6 text-text">Built for Students, by Students</h3>
          <p className="max-w-3xl mx-auto text-black">
            IntellEDGE is designed to support students throughout their academic journey. Whether you're preparing for an exam,
            catching up on missed notes, or planning your semester, this platform has all the tools you need in one place.
          </p>
        </AnimatedSection>

        {/* How It Works Section */}
        <AnimatedSection className="py-20 text-center" accentColor="orange">
          <h3 className="text-3xl font-semibold mb-12 text-text">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {["Create a Free Account", "Access All Features", "Study Smarter"].map((step, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white/50 backdrop-blur-sm border border-transparent shadow-sm">
                <div className="text-primary text-4xl font-bold mb-4">{i + 1}</div>
                <p className="text-lg text-text">{step}</p>
              </div>
            ))}
          </div>
        </AnimatedSection>

        {/* Testimonials Section */}
        <AnimatedSection className="py-20 text-center" accentColor="green">
          <h3 className="text-3xl font-semibold mb-12 text-text">What Students Are Saying</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              "The AI bot saved me hours during exam week! – Zainab, 300 Level",
              "This app makes school feel a lot more manageable. – Chuka, 200 Level",
              "Having my CGPA auto-calculated helped me plan better. – Ngozi, Final Year"
            ].map((quote, i) => (
              <div key={i} className="p-6 rounded-xl bg-white/50 backdrop-blur-sm border border-transparent shadow-sm">
                <p className="text-black italic">"{quote}"</p>
              </div>
            ))}
          </div>
        </AnimatedSection>

        {/* FAQ Section */}
        <AnimatedSection id="faq" className="py-20 text-center" accentColor="blue">
          <h3 className="text-3xl font-semibold mb-12 text-text">Frequently Asked Questions</h3>
          <div className="max-w-4xl mx-auto text-left space-y-6">
            <div className="p-6 rounded-xl bg-white/50 backdrop-blur-sm border border-transparent shadow-sm">
              <h4 className="font-bold text-text">Is IntellEDGE free?</h4>
              <p className="text-black">Yes! All features are free for students.</p>
            </div>
            <div className="p-6 rounded-xl bg-white/50 backdrop-blur-sm border border-transparent shadow-sm">
              <h4 className="font-bold text-text">Can I upload my own course materials?</h4>
              <p className="text-black">Absolutely. You can contribute to the eLibrary.</p>
            </div>
            <div className="p-6 rounded-xl bg-white/50 backdrop-blur-sm border border-transparent shadow-sm">
              <h4 className="font-bold text-text">How accurate is the CGPA calculator?</h4>
              <p className="text-black">It follows official grading systems and calculates in real time.</p>
            </div>
          </div>
        </AnimatedSection>

        {/* Final CTA */}
        <div className="bg-black w-full">
          <AnimatedSection className="py-20 text-center backdrop-blur-sm" accentColor="blue">
            <h3 className="text-3xl font-bold mb-4 text-white">Ready to Level Up Your Academic Game?</h3>
            <p className="text-lg mb-6 text-white/90">Join thousands of students using IntellEDGE to learn smarter—not harder.</p>
            <Link href="/signup">
              <Button variant="outline" className="bg-white text-black hover:bg-primary">Join Now – It's Free</Button>
            </Link>
          </AnimatedSection>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#152238] backdrop-blur-sm text-white text-center p-4 sm:p-6 text-sm sm:text-base">
        <div className="space-x-4">
          <a href="#about" className="hover:text-white">About</a>
          <Link href="/terms" className="hover:text-white">Terms</Link>
          <Link href="/privacy" className="hover:text-white">Privacy</Link>
          <a href="#" className="hover:text-white">Contact</a>
        </div>
        <p className="mt-4">© 2025 IntellEDGE. All rights reserved.</p>
      </footer>
    </div>
  )
} 