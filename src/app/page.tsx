"use client";

import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  
  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqData = [
    {
      question: "How do I create an account?",
      answer: "Simply click 'Get Started', fill out the registration form with your email and basic details. You'll receive an OTP for email verification, then wait for admin approval (usually 24-48 hours)."
    },
    {
      question: "Is reading free?",
      answer: "Yes! Reading all articles on VertoNote is completely free. We operate on an ad-supported model, so you can enjoy quality content without any subscription fees."
    },
    {
      question: "Sinhala & English?",
      answer: "VertoNote supports both Sinhala and English content. You can read articles in either language and use our built-in translation feature to switch between languages seamlessly."
    },
    {
      question: "Who can publish?",
      answer: "Only admin-approved writers can publish content. After registering as a reader, you can apply to become a writer. All articles go through our quality review process before publication."
    },
    {
      question: "Privacy?",
      answer: "We take your privacy seriously. We only collect necessary information for account management and personalization. Your reading habits help us recommend better content, but your data is never shared with third parties."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 lg:px-12">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 rounded-lg p-2">
            <span className="text-white font-bold text-xl">Vt</span>
          </div>
          <span className="text-xl font-semibold">
            Verto<span className="text-yellow-400">Note</span>
          </span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8">
          <a href="#" className="text-gray-300 hover:text-white transition-colors">Articles</a>
          <a href="#" className="text-gray-300 hover:text-white transition-colors">Categories</a>
          <a href="#" className="text-gray-300 hover:text-white transition-colors">Writers</a>
          <a href="#" className="text-gray-300 hover:text-white transition-colors">Search</a>
        </nav>
        
        <Link href="/register">
          <button className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-medium transition-colors">
            Get Started
          </button>
        </Link>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-16 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
              A Modern
              <br />
              <span className="text-blue-400">Sinhala/English</span>
              <br />
              Blogging Platform
            </h1>
            
            <p className="text-gray-300 text-lg leading-relaxed">
              AI-powered recommendations, distraction-free reading, with admin-moderated quality and multi-language support.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register">
                <button className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg font-medium text-lg transition-colors w-full sm:w-auto">
                  Start Reading
                </button>
              </Link>
              <Link href="/login">
                <button className="border border-gray-600 hover:border-gray-500 px-8 py-3 rounded-lg font-medium text-lg transition-colors w-full sm:w-auto">
                  Sign In
                </button>
              </Link>
            </div>
            
            <div className="flex items-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-300">Free to read</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-300">Admin-approved content</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-300">Sinhala & English</span>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="bg-slate-800 rounded-2xl p-6 space-y-4">
              <div className="bg-slate-700 rounded-lg p-4 h-32"></div>
              <div className="bg-slate-700 rounded-lg p-4 h-32"></div>
            </div>
            <div className="absolute -top-4 -right-4 bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-medium">
              Preview
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-16 lg:px-12">
        <h2 className="text-3xl font-bold text-center mb-16">Features</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* AI Recommendations */}
          <div className="bg-slate-800 rounded-xl p-8 space-y-4">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🤖</span>
            </div>
            <h3 className="text-xl font-semibold">AI Recommendations</h3>
            <p className="text-gray-300">
              Personalized feed from interests, time-on-page, completion rate.
            </p>
          </div>

          {/* Sinhala & English */}
          <div className="bg-slate-800 rounded-xl p-8 space-y-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🌐</span>
            </div>
            <h3 className="text-xl font-semibold">Sinhala & English</h3>
            <p className="text-gray-300">
              Read and translate seamlessly between Sinhala and English.
            </p>
          </div>

          {/* Distraction-free Mode */}
          <div className="bg-slate-800 rounded-xl p-8 space-y-4">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📖</span>
            </div>
            <h3 className="text-xl font-semibold">Distraction-free Mode</h3>
            <p className="text-gray-300">
              Clean reading mode with typography controls and TTS.
            </p>
          </div>

          {/* Community & Comments */}
          <div className="bg-slate-800 rounded-xl p-8 space-y-4">
            <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
              <span className="text-2xl">💬</span>
            </div>
            <h3 className="text-xl font-semibold">Community & Comments</h3>
            <p className="text-gray-300">
              Reactions, replies, and respectful discussions with moderation.
            </p>
          </div>

          {/* Powerful Search */}
          <div className="bg-slate-800 rounded-xl p-8 space-y-4">
            <div className="w-12 h-12 bg-pink-600 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🔍</span>
            </div>
            <h3 className="text-xl font-semibold">Powerful Search</h3>
            <p className="text-gray-300">
              Full-text search with smart filters and suggestions.
            </p>
          </div>

          {/* Bookmarks & Lists */}
          <div className="bg-slate-800 rounded-xl p-8 space-y-4">
            <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📚</span>
            </div>
            <h3 className="text-xl font-semibold">Bookmarks & Lists</h3>
            <p className="text-gray-300">
              Save, tag and organize articles into custom reading lists.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-6 py-16 lg:px-12">
        <h2 className="text-3xl font-bold mb-16">FAQ</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          {faqData.map((faq, index) => (
            <div key={index} className="bg-slate-800 rounded-xl p-8">
              <button
                onClick={() => toggleFaq(index)}
                className="w-full text-left flex items-center justify-between group"
              >
                <h3 className="text-xl font-semibold mb-4 group-hover:text-blue-400 transition-colors">
                  {faq.question}
                </h3>
                <div className={`transform transition-transform duration-300 ${
                  openFaq === index ? 'rotate-180' : ''
                }`}>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              
              <div className={`overflow-hidden transition-all duration-300 ${
                openFaq === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <p className="text-gray-300 leading-relaxed pt-2">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 px-6 py-8 lg:px-12">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            © 2025 VertoNote. All rights reserved.
          </p>
          
          <div className="flex gap-6 text-sm items-center">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a>
            
            {/* Social Media Icons */}
            <div className="flex gap-4 ml-4">
              {/* Facebook */}
              <a href="#" className="text-gray-400 hover:text-blue-500 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              
              {/* YouTube */}
              <a href="#" className="text-gray-400 hover:text-red-500 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              
              {/* TikTok */}
              <a href="#" className="text-gray-400 hover:text-pink-500 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                </svg>
              </a>
              
              {/* Instagram */}
              <a href="#" className="text-gray-400 hover:text-purple-500 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
