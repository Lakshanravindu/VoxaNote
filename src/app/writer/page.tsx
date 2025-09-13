"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';

interface Draft {
  id: string;
  title: string;
  excerpt: string;
  status: 'draft' | 'review' | 'revision' | 'approved' | 'published';
  wordCount: number;
  lastModified: string;
  category: string;
}

interface WriterStats {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  totalViews: number;
  totalLikes: number;
  avgReadingTime: number;
}

export default function WriterDashboard() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [recentDrafts, setRecentDrafts] = useState<Draft[]>([]);
  const [stats, setStats] = useState<WriterStats>({
    totalArticles: 0,
    publishedArticles: 0,
    draftArticles: 0,
    totalViews: 0,
    totalLikes: 0,
    avgReadingTime: 0
  });

  useEffect(() => {
    // Check authentication and role
    if (!isAuthenticated || !user) {
      router.push('/login');
      return;
    }

    if (user.role !== 'writer') {
      router.push('/dashboard'); // Will redirect to correct role dashboard
      return;
    }

    setLoading(false);

    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    // Mock data - replace with API calls
    setRecentDrafts([
      {
        id: '1',
        title: 'Building Modern Web Applications with Next.js',
        excerpt: 'A comprehensive guide to creating scalable web applications using Next.js framework...',
        status: 'draft',
        wordCount: 1250,
        lastModified: '2024-01-15T10:30:00Z',
        category: 'Technology'
      },
      {
        id: '2',
        title: 'The Future of Artificial Intelligence',
        excerpt: 'Exploring the potential impact of AI on various industries and society as a whole...',
        status: 'review',
        wordCount: 2100,
        lastModified: '2024-01-14T15:45:00Z',
        category: 'Technology'
      },
      {
        id: '3',
        title: 'Understanding Sri Lankan Culture',
        excerpt: 'A deep dive into the rich cultural heritage and traditions of Sri Lanka...',
        status: 'published',
        wordCount: 1800,
        lastModified: '2024-01-12T09:20:00Z',
        category: 'Culture'
      }
    ]);

    setStats({
      totalArticles: 15,
      publishedArticles: 12,
      draftArticles: 3,
      totalViews: 8500,
      totalLikes: 340,
      avgReadingTime: 7
    });

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'text-gray-400 bg-gray-600/20';
      case 'review': return 'text-yellow-400 bg-yellow-600/20';
      case 'revision': return 'text-orange-400 bg-orange-600/20';
      case 'approved': return 'text-blue-400 bg-blue-600/20';
      case 'published': return 'text-green-400 bg-green-600/20';
      default: return 'text-gray-400 bg-gray-600/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return '📝';
      case 'review': return '👀';
      case 'revision': return '🔄';
      case 'approved': return '✅';
      case 'published': return '🚀';
      default: return '📄';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="bg-blue-600 rounded-lg p-2 w-10 h-10 flex items-center justify-center">
                <span className="text-white font-bold text-lg">Vt</span>
              </div>
              <span className="text-xl font-semibold">
                <span className="text-white">Verto</span><span className="text-yellow-400">Note</span>
              </span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/writer" className="text-blue-400 font-medium">📊 Dashboard</Link>
              <Link href="/writer/create" className="text-gray-300 hover:text-white transition-colors">✍️ Write</Link>
              <Link href="/writer/drafts" className="text-gray-300 hover:text-white transition-colors">📝 Drafts</Link>
              <Link href="/writer/analytics" className="text-gray-300 hover:text-white transition-colors">📈 Analytics</Link>
              <Link href="/writer/profile" className="text-gray-300 hover:text-white transition-colors">👤 Profile</Link>
              <button className="bg-red-500/20 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500/30 transition-colors">
                🚪 Logout
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <div className="bg-purple-600 rounded-full p-4 w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">✍️</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">
            Welcome Back, {user?.firstName || 'Writer'}!
          </h1>
          <p className="text-gray-300 text-lg mb-6">
            Ready to create amazing content? Here's your writing dashboard with all your tools and insights.
          </p>
          
          {/* Time Display */}
          <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-2">
              🕐 {formatTime(currentTime)}
            </span>
            <span className="flex items-center gap-2">
              📅 {formatDate(currentTime)}
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 text-center">
            <div className="bg-blue-600 rounded-full p-3 w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📚</span>
            </div>
            <div className="text-3xl font-bold text-blue-400 mb-2">{stats.publishedArticles}</div>
            <div className="text-gray-400 text-sm">Published Articles</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 text-center">
            <div className="bg-green-600 rounded-full p-3 w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">👁️</span>
            </div>
            <div className="text-3xl font-bold text-green-400 mb-2">{stats.totalViews.toLocaleString()}</div>
            <div className="text-gray-400 text-sm">Total Views</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 text-center">
            <div className="bg-pink-600 rounded-full p-3 w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">❤️</span>
            </div>
            <div className="text-3xl font-bold text-pink-400 mb-2">{stats.totalLikes}</div>
            <div className="text-gray-400 text-sm">Total Likes</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 text-center">
            <div className="bg-orange-600 rounded-full p-3 w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📝</span>
            </div>
            <div className="text-3xl font-bold text-orange-400 mb-2">{stats.draftArticles}</div>
            <div className="text-gray-400 text-sm">Drafts</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Drafts */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-green-600 rounded-lg p-2">
                    <span className="text-xl">📝</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-green-300">Recent Drafts</h2>
                    <p className="text-gray-400 text-sm">Your latest writing projects</p>
                  </div>
                </div>
                <Link href="/writer/create" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                  + New Article
                </Link>
              </div>

              <div className="space-y-4">
                {recentDrafts.map((draft) => (
                  <div key={draft.id} className="bg-slate-700/30 rounded-xl p-4 hover:bg-slate-700/50 transition-colors cursor-pointer">
                    <div className="flex items-start gap-4">
                      <div className="bg-purple-600 rounded-lg p-2 flex-shrink-0">
                        <span className="text-sm">{getStatusIcon(draft.status)}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-white">{draft.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(draft.status)}`}>
                            {draft.status}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm mb-3 line-clamp-2">{draft.excerpt}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{draft.wordCount} words</span>
                          <span className="text-blue-400">{draft.category}</span>
                          <span>Modified {new Date(draft.lastModified).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-orange-600 rounded-lg p-2">
                  <span className="text-xl">⚡</span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-orange-300">Quick Actions</h2>
                  <p className="text-gray-400 text-sm">Access your writing tools</p>
                </div>
              </div>

              <div className="space-y-3">
                <Link href="/writer/create" className="flex items-center gap-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 p-3 rounded-lg transition-colors">
                  <span>✍️</span>
                  <span className="font-medium">Write New Article</span>
                  <span className="ml-auto">→</span>
                </Link>

                <Link href="/writer/drafts" className="flex items-center gap-3 bg-green-600/20 hover:bg-green-600/30 text-green-400 p-3 rounded-lg transition-colors">
                  <span>📝</span>
                  <span className="font-medium">Manage Drafts</span>
                  <span className="ml-auto">→</span>
                </Link>

                <Link href="/writer/analytics" className="flex items-center gap-3 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 p-3 rounded-lg transition-colors">
                  <span>📈</span>
                  <span className="font-medium">View Analytics</span>
                  <span className="ml-auto">→</span>
                </Link>

                <Link href="/writer/profile" className="flex items-center gap-3 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 p-3 rounded-lg transition-colors">
                  <span>👤</span>
                  <span className="font-medium">Writer Profile</span>
                  <span className="ml-auto">→</span>
                </Link>
              </div>
            </div>

            {/* Performance Insights */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-yellow-600 rounded-lg p-2">
                  <span className="text-xl">📊</span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-yellow-300">This Month</h2>
                  <p className="text-gray-400 text-sm">Your writing performance</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-600 rounded-full p-2">
                      <span className="text-sm">📄</span>
                    </div>
                    <div>
                      <div className="font-medium text-blue-400">Articles Published</div>
                      <div className="text-xs text-gray-500">This month</div>
                    </div>
                  </div>
                  <div className="text-xl font-bold text-blue-400">3</div>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-600 rounded-full p-2">
                      <span className="text-sm">👀</span>
                    </div>
                    <div>
                      <div className="font-medium text-green-400">Average Views</div>
                      <div className="text-xs text-gray-500">Per article</div>
                    </div>
                  </div>
                  <div className="text-xl font-bold text-green-400">1.2K</div>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-pink-600 rounded-full p-2">
                      <span className="text-sm">❤️</span>
                    </div>
                    <div>
                      <div className="font-medium text-pink-400">Engagement Rate</div>
                      <div className="text-xs text-gray-500">Likes & comments</div>
                    </div>
                  </div>
                  <div className="text-xl font-bold text-pink-400">8.5%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
