"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  readingTime: number;
  category: string;
  publishedAt: string;
  featuredImage?: string;
}

export default function ReaderDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);

  useEffect(() => {
    // Wait for auth state to be loaded from localStorage
    if (authLoading) {
      console.log('Auth still loading, waiting...');
      return;
    }

    // Check authentication and role
    if (!isAuthenticated || !user) {
      console.log('Not authenticated, redirecting to login');
      router.push('/login');
      return;
    }

    if (user.role !== 'reader') {
      console.log('User role is not reader, redirecting to dashboard');
      router.push('/dashboard'); // Will redirect to correct role dashboard
      return;
    }

    console.log('User authenticated and authorized for reader dashboard');
    setLoading(false);

    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    // Mock recent articles - replace with API call
    setRecentArticles([
      {
        id: '1',
        title: 'Getting Started with Modern Web Development',
        excerpt: 'Learn the fundamentals of building modern web applications with the latest technologies...',
        author: 'John Smith',
        readingTime: 8,
        category: 'Technology',
        publishedAt: '2024-01-15'
      },
      {
        id: '2', 
        title: 'Understanding Sri Lankan History',
        excerpt: 'A comprehensive guide to understanding the rich cultural heritage of Sri Lanka...',
        author: 'Priya Fernando',
        readingTime: 12,
        category: 'History',
        publishedAt: '2024-01-14'
      }
    ]);

    return () => clearInterval(timer);
  }, [isAuthenticated, user, router]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400">
            {authLoading ? 'Loading authentication...' : 'Loading your dashboard...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/50">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 sm:gap-3">
              <div className="bg-blue-600 rounded-lg p-1.5 sm:p-2 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center">
                <span className="text-white font-bold text-sm sm:text-lg">Vt</span>
              </div>
              <span className="text-lg sm:text-xl font-semibold">
                <span className="text-white">Verto</span><span className="text-yellow-400">Note</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6">
              <Link href="/reader" className="text-blue-400 font-medium">📊 Dashboard</Link>
              <Link href="/reader/articles" className="text-gray-300 hover:text-white transition-colors">📚 Articles</Link>
              <Link href="/reader/bookmarks" className="text-gray-300 hover:text-white transition-colors">🔖 Bookmarks</Link>
              <Link href="/reader/profile" className="text-gray-300 hover:text-white transition-colors">👤 Profile</Link>
              
              {/* User Profile in Header */}
              <div className="flex items-center gap-3 pl-4 border-l border-slate-600">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-700 flex items-center justify-center">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={`${user.firstName} ${user.lastName}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-bold text-blue-400">
                      {user?.firstName?.charAt(0) || 'R'}
                    </span>
                  )}
                </div>
                <div className="text-sm">
                  <div className="font-medium text-white">{user?.firstName || 'Reader'}</div>
                  <div className="text-xs text-gray-400 capitalize">{user?.level || 'rookie'}</div>
                </div>
                <button className="bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/30 transition-colors text-sm">
                  🚪 Logout
                </button>
              </div>
            </nav>

            {/* Mobile Navigation */}
            <div className="lg:hidden flex items-center gap-2 sm:gap-3">
              {/* Mobile User Profile */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden bg-slate-700 flex items-center justify-center">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={`${user.firstName} ${user.lastName}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs sm:text-sm font-bold text-blue-400">
                      {user?.firstName?.charAt(0) || 'R'}
                    </span>
                  )}
                </div>
                <div className="text-xs sm:text-sm">
                  <div className="font-medium text-white truncate max-w-16 sm:max-w-20">{user?.firstName || 'Reader'}</div>
                  <div className="text-xs text-gray-400 capitalize">{user?.level || 'rookie'}</div>
                </div>
              </div>
              
              <button className="bg-red-500/20 text-red-400 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg hover:bg-red-500/30 transition-colors text-xs sm:text-sm">
                🚪
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          <nav className="lg:hidden mt-3 pt-3 border-t border-slate-700/50">
            <div className="flex items-center justify-around">
              <Link href="/reader" className="flex flex-col items-center gap-1 text-blue-400">
                <span className="text-lg">📊</span>
                <span className="text-xs font-medium">Dashboard</span>
              </Link>
              <Link href="/reader/articles" className="flex flex-col items-center gap-1 text-gray-300">
                <span className="text-lg">📚</span>
                <span className="text-xs font-medium">Articles</span>
              </Link>
              <Link href="/reader/bookmarks" className="flex flex-col items-center gap-1 text-gray-300">
                <span className="text-lg">🔖</span>
                <span className="text-xs font-medium">Bookmarks</span>
              </Link>
              <Link href="/reader/profile" className="flex flex-col items-center gap-1 text-gray-300">
                <span className="text-lg">👤</span>
                <span className="text-xs font-medium">Profile</span>
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Welcome Section */}
        <div className="text-center mb-4 sm:mb-6 lg:mb-8">
          {/* User Profile Photo and Level */}
          <div className="relative mb-3 sm:mb-4 lg:mb-6">
            <div className="relative inline-block">
              {/* Profile Photo */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full overflow-hidden border-3 sm:border-4 border-blue-500/30 bg-slate-700 flex items-center justify-center">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-400">
                    {user?.firstName?.charAt(0) || 'R'}
                  </span>
                )}
              </div>
              
              {/* Level Badge */}
              <div className="absolute -bottom-1 sm:-bottom-2 -right-1 sm:-right-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full border-2 border-slate-900 shadow-lg">
                {user?.level || 'rookie'}
              </div>
            </div>
          </div>
          
          <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold mb-2 sm:mb-3">
            Welcome Back, {user?.firstName || 'Reader'}!
          </h1>
          
          {/* User Level and Points */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mb-3 sm:mb-4 lg:mb-6">
            <div className="bg-slate-800/50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-slate-700/50">
              <span className="text-xs sm:text-sm text-gray-300">
                Level: <span className="text-yellow-400 font-semibold capitalize">{user?.level || 'rookie'}</span>
              </span>
            </div>
            <div className="bg-slate-800/50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-slate-700/50">
              <span className="text-xs sm:text-sm text-gray-300">
                Points: <span className="text-blue-400 font-semibold">{user?.points || 0}</span>
              </span>
            </div>
          </div>
          
          <p className="text-gray-300 text-xs sm:text-sm lg:text-base xl:text-lg mb-3 sm:mb-4 lg:mb-6 px-2 sm:px-4 lg:px-0">
            Ready to continue your reading journey? Here's your personalized dashboard with everything you need to discover great content.
          </p>
          
          {/* Time Display */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-400">
            <span className="flex items-center gap-2">
              🕐 {formatTime(currentTime)}
            </span>
            <span className="flex items-center gap-2">
              📅 {formatDate(currentTime)}
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-2 sm:p-3 lg:p-6 text-center">
            <div className="bg-blue-600 rounded-full p-1 sm:p-1.5 lg:p-3 w-6 h-6 sm:w-8 sm:h-8 lg:w-12 lg:h-12 flex items-center justify-center mx-auto mb-1.5 sm:mb-2 lg:mb-4">
              <span className="text-xs sm:text-sm lg:text-2xl">📚</span>
            </div>
            <div className="text-base sm:text-lg lg:text-3xl font-bold text-blue-400 mb-1 sm:mb-2">{user?.articlesRead || 0}</div>
            <div className="text-gray-400 text-xs sm:text-sm">Articles Read</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-2 sm:p-3 lg:p-6 text-center">
            <div className="bg-green-600 rounded-full p-1 sm:p-1.5 lg:p-3 w-6 h-6 sm:w-8 sm:h-8 lg:w-12 lg:h-12 flex items-center justify-center mx-auto mb-1.5 sm:mb-2 lg:mb-4">
              <span className="text-xs sm:text-sm lg:text-2xl">📈</span>
            </div>
            <div className="text-base sm:text-lg lg:text-3xl font-bold text-green-400 mb-1 sm:mb-2">{Math.round((user?.totalReadingTime || 0) / 60) || 0}h</div>
            <div className="text-gray-400 text-xs sm:text-sm">Reading Time</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-2 sm:p-3 lg:p-6 text-center">
            <div className="bg-pink-600 rounded-full p-1 sm:p-1.5 lg:p-3 w-6 h-6 sm:w-8 sm:h-8 lg:w-12 lg:h-12 flex items-center justify-center mx-auto mb-1.5 sm:mb-2 lg:mb-4">
              <span className="text-xs sm:text-sm lg:text-2xl">🔥</span>
            </div>
            <div className="text-base sm:text-lg lg:text-3xl font-bold text-pink-400 mb-1 sm:mb-2">{user?.readingStreak || 0}</div>
            <div className="text-gray-400 text-xs sm:text-sm">Day Streak</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-2 sm:p-3 lg:p-6 text-center">
            <div className="bg-orange-600 rounded-full p-1 sm:p-1.5 lg:p-3 w-6 h-6 sm:w-8 sm:h-8 lg:w-12 lg:h-12 flex items-center justify-center mx-auto mb-1.5 sm:mb-2 lg:mb-4">
              <span className="text-xs sm:text-sm lg:text-2xl">🏆</span>
            </div>
            <div className="text-base sm:text-lg lg:text-3xl font-bold text-orange-400 mb-1 sm:mb-2">{user?.points || 0}</div>
            <div className="text-gray-400 text-xs sm:text-sm">Points</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-8">
          {/* Today's Recommendations */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6 lg:mb-8">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="bg-green-600 rounded-lg p-1.5 sm:p-2">
                  <span className="text-lg sm:text-xl">📖</span>
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-green-300">Today's Recommendations</h2>
                  <p className="text-gray-400 text-xs sm:text-sm">Curated articles based on your interests</p>
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {recentArticles.map((article) => (
                  <div key={article.id} className="bg-slate-700/30 rounded-xl p-3 sm:p-4 hover:bg-slate-700/50 transition-colors cursor-pointer">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="bg-blue-600 rounded-lg p-1.5 sm:p-2 flex-shrink-0">
                        <span className="text-xs sm:text-sm">📄</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white mb-1 sm:mb-2 text-sm sm:text-base line-clamp-2">{article.title}</h3>
                        <p className="text-gray-400 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">{article.excerpt}</p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-gray-500">
                          <span>By {article.author}</span>
                          <span>{article.readingTime} min read</span>
                          <span className="text-blue-400">{article.category}</span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 flex-shrink-0">
                        {new Date(article.publishedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6 lg:mb-8">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="bg-orange-600 rounded-lg p-1.5 sm:p-2">
                  <span className="text-lg sm:text-xl">⚡</span>
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-orange-300">Quick Actions</h2>
                  <p className="text-gray-400 text-xs sm:text-sm">Access your tools</p>
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <Link href="/reader/articles" className="flex items-center gap-2 sm:gap-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 p-2.5 sm:p-3 rounded-lg transition-colors">
                  <span className="text-sm sm:text-base">📚</span>
                  <span className="font-medium text-sm sm:text-base">Browse Articles</span>
                  <span className="ml-auto text-sm sm:text-base">→</span>
                </Link>

                <Link href="/reader/bookmarks" className="flex items-center gap-2 sm:gap-3 bg-green-600/20 hover:bg-green-600/30 text-green-400 p-2.5 sm:p-3 rounded-lg transition-colors">
                  <span className="text-sm sm:text-base">🔖</span>
                  <span className="font-medium text-sm sm:text-base">My Bookmarks</span>
                  <span className="ml-auto text-sm sm:text-base">→</span>
                </Link>

                <Link href="/reader/profile" className="flex items-center gap-2 sm:gap-3 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 p-2.5 sm:p-3 rounded-lg transition-colors">
                  <span className="text-sm sm:text-base">👤</span>
                  <span className="font-medium text-sm sm:text-base">Profile & Settings</span>
                  <span className="ml-auto text-sm sm:text-base">→</span>
                </Link>
              </div>
            </div>

            {/* Recent Achievements */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="bg-yellow-600 rounded-lg p-1.5 sm:p-2">
                  <span className="text-lg sm:text-xl">🏆</span>
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-yellow-300">Recent Achievements</h2>
                  <p className="text-gray-400 text-xs sm:text-sm">Celebrating your reading milestones</p>
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-slate-700/30 rounded-lg">
                  <div className="bg-green-600 rounded-full p-1.5 sm:p-2">
                    <span className="text-xs sm:text-sm">✅</span>
                  </div>
                  <div>
                    <div className="font-medium text-green-400 text-sm sm:text-base">First Article</div>
                    <div className="text-xs text-gray-500">Completed your first read</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-slate-700/30 rounded-lg">
                  <div className="bg-blue-600 rounded-full p-1.5 sm:p-2">
                    <span className="text-xs sm:text-sm">🎯</span>
                  </div>
                  <div>
                    <div className="font-medium text-blue-400 text-sm sm:text-base">Profile Setup</div>
                    <div className="text-xs text-gray-500">Completed your profile</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
