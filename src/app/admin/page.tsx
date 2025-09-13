"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import UserProfileModal from '@/components/admin/UserProfileModal';
import { supabase } from '@/lib/supabase';
import { useToast, ToastProvider } from '@/components/ui/ToastManager';

interface PendingUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username?: string;
  avatarUrl?: string;
  bio?: string;
  country?: string;
  defaultLanguage?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
  requestedRole: 'reader' | 'writer';
  status: 'pending' | 'email_verified';
  registeredAt: string;
}

interface PendingArticle {
  id: string;
  title: string;
  author: string;
  category: string;
  status: 'review' | 'revision';
  submittedAt: string;
  wordCount: number;
}

interface AdminStats {
  totalUsers: number;
  pendingApprovals: number;
  totalArticles: number;
  pendingArticles: number;
  monthlySignups: number;
  monthlyArticles: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { showSuccess, showError, showWarning } = useToast();
  const [loading, setLoading] = useState(true);

  // Handle logout
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  const [currentTime, setCurrentTime] = useState(new Date());
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [pendingArticles, setPendingArticles] = useState<PendingArticle[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    pendingApprovals: 0,
    totalArticles: 0,
    pendingArticles: 0,
    monthlySignups: 0,
    monthlyArticles: 0
  });
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  // Fetch admin stats
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
        console.log('Admin stats loaded:', data.stats);
        if (data.simulation) {
          console.log('Using simulation data for stats');
        }
      } else {
        console.error('Failed to fetch stats:', data.error);
        setError('Failed to load statistics');
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to load statistics');
    }
  };

  // Fetch pending users
  const fetchPendingUsers = async () => {
    try {
      const response = await fetch('/api/admin/pending-users');
      const data = await response.json();
      
      if (data.success) {
        setPendingUsers(data.users);
        console.log('Pending users loaded:', data.users.length, 'users');
        if (data.simulation) {
          console.log('Using simulation data for pending users');
        }
      } else {
        console.error('Failed to fetch pending users:', data.error);
        setError('Failed to load pending users');
      }
    } catch (err) {
      console.error('Error fetching pending users:', err);
      setError('Failed to load pending users');
    }
  };

  // Load all admin data
  const loadAdminData = async () => {
    setDataLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchStats(),
        fetchPendingUsers()
      ]);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setDataLoading(false);
    }
  };

  // Handle user approval/rejection
  const handleUserAction = async (userId: string, approved: boolean, reason?: string) => {
    try {
      const response = await fetch('/api/admin/approve-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, approved, reason })
      });

      const data = await response.json();

      if (data.success) {
        console.log(`User ${approved ? 'approved' : 'rejected'} successfully:`, data.user);
        
        // Remove user from pending list
        setPendingUsers(prev => prev.filter(u => u.id !== userId));
        
        // Refresh stats
        await fetchStats();
        
        // Show success toast
        const actionText = approved ? 'approved' : 'rejected';
        showSuccess(
          `User ${actionText} successfully!`,
          `The user has been ${actionText} and notified via email.`
        );
      } else {
        console.error(`Failed to ${approved ? 'approve' : 'reject'} user:`, data.error);
        showError(
          `Failed to ${approved ? 'approve' : 'reject'} user`,
          data.error || 'An unexpected error occurred. Please try again.'
        );
      }
    } catch (err) {
      console.error(`Error ${approved ? 'approving' : 'rejecting'} user:`, err);
      showError(
        `Error ${approved ? 'approving' : 'rejecting'} user`,
        'A network or system error occurred. Please check your connection and try again.'
      );
    }
  };

  // Handle view user profile
  const handleViewUser = (user: PendingUser) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowUserModal(false);
    setSelectedUser(null);
  };

  useEffect(() => {
    console.log('Admin dashboard useEffect - Auth state:', { isAuthenticated, user });
    
    // Give some time for AuthStore to hydrate from localStorage
    const checkAuth = () => {
      if (!isAuthenticated || !user) {
        console.log('No authentication, redirecting to login');
        router.push('/login');
        return;
      }

      console.log('User role:', user.role);
      if (user.role !== 'admin') {
        console.log('User is not admin, redirecting to dashboard');
        router.push('/dashboard'); // Will redirect to correct role dashboard
        return;
      }

      console.log('Admin authenticated successfully');
      setLoading(false);
      
      // Load admin data after authentication
      loadAdminData();
    };

    // Wait a bit for store to hydrate
    const authTimer = setTimeout(checkAuth, 100);
    
    // Update time every minute
    const timeTimer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => {
      clearTimeout(authTimer);
      clearInterval(timeTimer);
    };

    // Mock data - replace with API calls
    setPendingUsers([
      {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        requestedRole: 'reader',
        status: 'email_verified',
        registeredAt: '2024-01-15T10:30:00Z'
      },
      {
        id: '2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        requestedRole: 'writer',
        status: 'email_verified',
        registeredAt: '2024-01-14T15:45:00Z'
      },
      {
        id: '3',
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike.johnson@example.com',
        requestedRole: 'reader',
        status: 'email_verified',
        registeredAt: '2024-01-13T09:20:00Z'
      }
    ]);

    setPendingArticles([
      {
        id: '1',
        title: 'Introduction to Machine Learning',
        author: 'Sarah Wilson',
        category: 'Technology',
        status: 'review',
        submittedAt: '2024-01-15T08:30:00Z',
        wordCount: 1800
      },
      {
        id: '2',
        title: 'Cultural Heritage of Sri Lanka',
        author: 'Priya Fernando',
        category: 'Culture',
        status: 'revision',
        submittedAt: '2024-01-14T14:20:00Z',
        wordCount: 2200
      }
    ]);

    setStats({
      totalUsers: 1247,
      pendingApprovals: 8,
      totalArticles: 342,
      pendingArticles: 5,
      monthlySignups: 89,
      monthlyArticles: 23
    });

    // Cleanup handled above in the main return statement
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

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'reader': return 'text-blue-400 bg-blue-600/20';
      case 'writer': return 'text-purple-400 bg-purple-600/20';
      default: return 'text-gray-400 bg-gray-600/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'review': return 'text-yellow-400 bg-yellow-600/20';
      case 'revision': return 'text-orange-400 bg-orange-600/20';
      default: return 'text-gray-400 bg-gray-600/20';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
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
              <Link href="/admin" className="text-blue-400 font-medium">📊 Dashboard</Link>
              <Link href="/admin/users" className="text-gray-300 hover:text-white transition-colors">👥 Users</Link>
              <Link href="/admin/articles" className="text-gray-300 hover:text-white transition-colors">📚 Articles</Link>
              <Link href="/admin/analytics" className="text-gray-300 hover:text-white transition-colors">📈 Analytics</Link>
              <Link href="/admin/settings" className="text-gray-300 hover:text-white transition-colors">⚙️ Settings</Link>
              <button 
                onClick={handleLogout}
                className="bg-red-500/20 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500/30 transition-colors"
              >
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
          <div className="bg-red-600 rounded-full p-4 w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">👑</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">
            Admin Dashboard
          </h1>
          <p className="text-gray-300 text-lg mb-6">
            Welcome back, {user?.firstName}! Manage your platform with full control over users, content, and system settings.
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
              <span className="text-2xl">👥</span>
            </div>
            <div className="text-3xl font-bold text-blue-400 mb-2">{stats.totalUsers.toLocaleString()}</div>
            <div className="text-gray-400 text-sm">Total Users</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 text-center">
            <div className="bg-yellow-600 rounded-full p-3 w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⏳</span>
            </div>
            <div className="text-3xl font-bold text-yellow-400 mb-2">{stats.pendingApprovals}</div>
            <div className="text-gray-400 text-sm">Pending Approvals</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 text-center">
            <div className="bg-green-600 rounded-full p-3 w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📚</span>
            </div>
            <div className="text-3xl font-bold text-green-400 mb-2">{stats.totalArticles}</div>
            <div className="text-gray-400 text-sm">Total Articles</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 text-center">
            <div className="bg-orange-600 rounded-full p-3 w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📝</span>
            </div>
            <div className="text-3xl font-bold text-orange-400 mb-2">{stats.pendingArticles}</div>
            <div className="text-gray-400 text-sm">Pending Reviews</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Pending User Approvals */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-yellow-600 rounded-lg p-2">
                    <span className="text-xl">👥</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-yellow-300">Pending User Approvals</h2>
                    <p className="text-gray-400 text-sm">Users waiting for approval</p>
                  </div>
                </div>
                <Link href="/admin/users" className="text-blue-400 hover:text-blue-300 transition-colors text-sm">
                  View All →
                </Link>
              </div>

              {error && (
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-4">
                  <p className="text-red-300 text-sm">{error}</p>
                  <button 
                    onClick={loadAdminData}
                    className="mt-2 text-red-400 hover:text-red-300 text-sm underline"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {dataLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                  <span className="ml-2 text-gray-400">Loading users...</span>
                </div>
              )}

              <div className="space-y-4">
                {pendingUsers.length === 0 && !dataLoading && (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No pending approvals</p>
                  </div>
                )}

                {pendingUsers.map((user) => (
                  <div key={user.id} className="bg-slate-700/30 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="relative bg-blue-600 rounded-full p-2 w-10 h-10 flex items-center justify-center overflow-hidden">
                          {user.avatarUrl ? (
                            <img 
                              src={user.avatarUrl} 
                              alt={`${user.firstName} ${user.lastName}`}
                              className="w-10 h-10 rounded-full object-cover absolute inset-0"
                              onError={(e) => {
                                // Fallback to initials if image fails to load
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = `<span class="text-sm font-bold text-white">${user.firstName[0]}${user.lastName[0]}</span>`;
                                }
                              }}
                            />
                          ) : (
                            <span className="text-sm font-bold text-white">{user.firstName[0]}{user.lastName[0]}</span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{user.firstName} {user.lastName}</h3>
                          <p className="text-gray-400 text-sm">{user.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.requestedRole)}`}>
                              {user.requestedRole}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(user.registeredAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleViewUser(user)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                        disabled={dataLoading}
                      >
                        View
                      </button>
                      <button 
                        onClick={() => handleUserAction(user.id, true)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                        disabled={dataLoading}
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => handleUserAction(user.id, false)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                        disabled={dataLoading}
                      >
                        Reject
                      </button>
                    </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending Article Reviews */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-600 rounded-lg p-2">
                    <span className="text-xl">📝</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-orange-300">Article Reviews</h2>
                    <p className="text-gray-400 text-sm">Articles awaiting review</p>
                  </div>
                </div>
                <Link href="/admin/articles" className="text-blue-400 hover:text-blue-300 transition-colors text-sm">
                  View All →
                </Link>
              </div>

              <div className="space-y-4">
                {pendingArticles.map((article) => (
                  <div key={article.id} className="bg-slate-700/30 rounded-xl p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-white">{article.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(article.status)}`}>
                            {article.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>By {article.author}</span>
                          <span>{article.wordCount} words</span>
                          <span className="text-blue-400">{article.category}</span>
                          <span>{new Date(article.submittedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm transition-colors">
                          Review
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions & System Stats */}
          <div>
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-purple-600 rounded-lg p-2">
                  <span className="text-xl">⚡</span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-purple-300">Quick Actions</h2>
                  <p className="text-gray-400 text-sm">Admin tools</p>
                </div>
              </div>

              <div className="space-y-3">
                <Link href="/admin/users" className="flex items-center gap-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 p-3 rounded-lg transition-colors">
                  <span>👥</span>
                  <span className="font-medium">Manage Users</span>
                  <span className="ml-auto">→</span>
                </Link>

                <Link href="/admin/articles" className="flex items-center gap-3 bg-green-600/20 hover:bg-green-600/30 text-green-400 p-3 rounded-lg transition-colors">
                  <span>📚</span>
                  <span className="font-medium">Review Articles</span>
                  <span className="ml-auto">→</span>
                </Link>

                <Link href="/admin/analytics" className="flex items-center gap-3 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 p-3 rounded-lg transition-colors">
                  <span>📈</span>
                  <span className="font-medium">View Analytics</span>
                  <span className="ml-auto">→</span>
                </Link>

                <Link href="/admin/settings" className="flex items-center gap-3 bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 p-3 rounded-lg transition-colors">
                  <span>⚙️</span>
                  <span className="font-medium">System Settings</span>
                  <span className="ml-auto">→</span>
                </Link>
              </div>
            </div>

            {/* System Overview */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-green-600 rounded-lg p-2">
                  <span className="text-xl">📊</span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-green-300">This Month</h2>
                  <p className="text-gray-400 text-sm">Platform activity</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-600 rounded-full p-2">
                      <span className="text-sm">👥</span>
                    </div>
                    <div>
                      <div className="font-medium text-blue-400">New Signups</div>
                      <div className="text-xs text-gray-500">This month</div>
                    </div>
                  </div>
                  <div className="text-xl font-bold text-blue-400">{stats.monthlySignups}</div>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-600 rounded-full p-2">
                      <span className="text-sm">📚</span>
                    </div>
                    <div>
                      <div className="font-medium text-green-400">Articles Published</div>
                      <div className="text-xs text-gray-500">This month</div>
                    </div>
                  </div>
                  <div className="text-xl font-bold text-green-400">{stats.monthlyArticles}</div>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-yellow-600 rounded-full p-2">
                      <span className="text-sm">⚡</span>
                    </div>
                    <div>
                      <div className="font-medium text-yellow-400">System Status</div>
                      <div className="text-xs text-gray-500">All systems</div>
                    </div>
                  </div>
                  <div className="text-green-400 font-medium">✅ Online</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* User Profile Modal */}
      {selectedUser && (
        <UserProfileModal
          user={selectedUser as any}
          isOpen={showUserModal}
          onClose={handleCloseModal}
          onApprove={handleUserAction}
          onReject={handleUserAction}
        />
      )}

      </div>
    </ToastProvider>
  );
}
