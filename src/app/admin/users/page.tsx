"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import UserProfileModal from '@/components/admin/UserProfileModal';
import UserActionModal from '@/components/admin/UserActionModal';
import ActionConfirmModal from '@/components/admin/ActionConfirmModal';
import { useToast } from '@/components/ui/ToastManager';
import { supabase } from '@/lib/supabase';

interface User {
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
  role: 'reader' | 'writer' | 'admin';
  status: 'pending' | 'email_verified' | 'approved' | 'suspended' | 'banned';
  points: number;
  level: string;
  readingStreak: number;
  articlesRead: number;
  totalReadingTime: number;
  lastActiveDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function AdminUsersPage() {
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
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });
  
  // Filters and search
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  
  // Action modal state
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionModalData, setActionModalData] = useState<{
    user: User;
    action: 'suspend';
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Confirm modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalData, setConfirmModalData] = useState<{
    user: User;
    action: 'restore' | 'approve' | 'reject';
    reason?: string;
    newStatus?: string;
  } | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Check authentication
  useEffect(() => {
    const checkAuth = () => {
      if (!isAuthenticated || !user) {
        router.push('/login');
        return;
      }

      if (user.role !== 'admin') {
        router.push('/dashboard');
        return;
      }

      setLoading(false);
    };

    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [isAuthenticated, user, router]);

  // Fetch users data
  const fetchUsers = async (page: number = 1) => {
    setDataLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString()
      });

      if (statusFilter) params.append('status', statusFilter);
      if (roleFilter) params.append('role', roleFilter);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const response = await fetch(`/api/admin/users?${params}`);
      const data = await response.json();

      if (data.success) {
        setUsers(data.users);
        setPagination(data.pagination);
        console.log('Users loaded:', data.users.length, 'users');
        console.log('Sample user data:', data.users[0]);
        if (data.simulation) {
          console.log('⚠️ Using simulation data - check database connection');
        } else {
          console.log('✅ Using real database data');
        }
      } else {
        console.error('Failed to fetch users:', data.error);
        setError('Failed to load users');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
    } finally {
      setDataLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    if (!loading) {
      fetchUsers();
    }
  }, [loading, statusFilter, roleFilter, searchQuery]);

  // Handle user actions
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
        
        // Refresh users list
        await fetchUsers(pagination.page);
        
        // Show success message
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
  const handleViewUser = (user: User) => {
    console.log('Selected user for profile view:', user);
    console.log('Social links data:', user.socialLinks);
    setSelectedUser(user);
    setShowUserModal(true);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowUserModal(false);
    setSelectedUser(null);
  };

  // Handle action modal
  const openActionModal = (user: User, action: 'suspend') => {
    setActionModalData({ user, action });
    setShowActionModal(true);
  };

  const closeActionModal = () => {
    setShowActionModal(false);
    setActionModalData(null);
  };

  // Handle confirm modal
  const openConfirmModal = (user: User, action: 'unban' | 'restore' | 'approve' | 'reject', reason?: string, newStatus?: string) => {
    setConfirmModalData({ user, action, reason, newStatus });
    setShowConfirmModal(true);
  };

  const closeConfirmModal = () => {
    setShowConfirmModal(false);
    setConfirmModalData(null);
  };

  const handleConfirmAction = async () => {
    if (!confirmModalData) return;

    setConfirmLoading(true);
    try {
      const { user, action, reason, newStatus } = confirmModalData;
      
      if (action === 'approve' || action === 'reject') {
        // Handle approval/rejection
        await handleUserAction(user.id, action === 'approve', reason);
      } else if (action === 'restore') {
        // Handle unsuspend/restore actions - treat as unban for API
        const response = await fetch('/api/admin/manage-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            userId: user.id, 
            action: 'unban', 
            reason: reason || 'Account unsuspended by admin',
            newStatus: newStatus,
            notes: `Action performed by admin via dashboard` 
          })
        });

        const data = await response.json();

        if (data.success) {
          console.log('User unsuspended successfully:', data.user);
          
          // Refresh users list
          await fetchUsers(pagination.page);
          
          // Show specific success message for unsuspend
          showSuccess(
            'User unsuspended successfully!',
            `${user.firstName} ${user.lastName} has been unsuspended and can now access the platform.`
          );
        } else {
          console.error('Failed to unsuspend user:', data.error);
          showError(
            'Failed to unsuspend user',
            data.error || 'An unexpected error occurred. Please try again.'
          );
          return; // Don't close modal on error
        }
      } else {
        // Handle other actions
        await handleManageUser(user.id, action, reason || `Account ${action} by admin`, newStatus);
      }

      closeConfirmModal();
    } catch (err) {
      console.error(`Error ${confirmModalData.action} user:`, err);
      showError(
        `Error ${confirmModalData.action === 'restore' ? 'unsuspending' : confirmModalData.action + 'ing'} user`,
        'An unexpected error occurred. Please try again.'
      );
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleActionConfirm = async (reason: string) => {
    if (!actionModalData) return;

    setActionLoading(true);
    try {
      const response = await fetch('/api/admin/manage-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: actionModalData.user.id, 
          action: actionModalData.action, 
          reason,
          notes: `Action performed by admin via dashboard` 
        })
      });

      const data = await response.json();

      if (data.success) {
        console.log(`User ${actionModalData.action} successful:`, data.user);
        
        // Refresh users list
        await fetchUsers(pagination.page);
        
        // Show success message
        showSuccess(
          `User ${actionModalData.action} completed successfully!`,
          `${actionModalData.user.firstName} ${actionModalData.user.lastName} has been ${actionModalData.action}ed and notified via email.`
        );
        
        // Close modal
        closeActionModal();
      } else {
        console.error(`Failed to ${actionModalData.action} user:`, data.error);
        showError(
          `Failed to ${actionModalData.action} user`,
          data.error || 'An unexpected error occurred. Please try again.'
        );
      }
    } catch (err) {
      console.error(`Error ${actionModalData.action} user:`, err);
      showError(
        `Error ${actionModalData.action}ing user`,
        'A network or system error occurred. Please check your connection and try again.'
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Handle user management actions (ban, suspend, delete, etc.)
  const handleManageUser = async (userId: string, action: string, reason: string, newStatus?: string) => {
    const confirmMessage = getConfirmMessage(action, reason);
    
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/manage-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId, 
          action, 
          reason,
          newStatus,
          notes: `Action performed by admin via dashboard` 
        })
      });

      const data = await response.json();

      if (data.success) {
        console.log(`User ${action} successful:`, data.user);
        
        // Refresh users list
        await fetchUsers(pagination.page);
        
        // Show success message
        showSuccess(
          `User ${action} completed successfully!`,
          `Action completed and user has been notified via email.`
        );
      } else {
        console.error(`Failed to ${action} user:`, data.error);
        showError(
          `Failed to ${action} user`,
          data.error || 'An unexpected error occurred. Please try again.'
        );
      }
    } catch (err) {
      console.error(`Error ${action} user:`, err);
      showError(
        `Error ${action}ing user`,
        'A network or system error occurred. Please check your connection and try again.'
      );
    }
  };


  // Get confirmation message for actions
  const getConfirmMessage = (action: string, reason: string): string => {
    switch (action) {
      case 'ban':
        return `Are you sure you want to BAN this user?\n\nReason: ${reason}\n\nThis will prevent them from accessing the platform and notify them via email.`;
      case 'unban':
        return `Are you sure you want to UNBAN this user?\n\nReason: ${reason}\n\nThis will restore their access and notify them via email.`;
      case 'suspend':
        return `Are you sure you want to SUSPEND this user?\n\nReason: ${reason}\n\nThis will temporarily restrict their access and notify them via email.`;
      case 'restore':
        return `Are you sure you want to RESTORE this user?\n\nReason: ${reason}\n\nThis will reactivate their account and notify them via email.`;
      default:
        return `Are you sure you want to ${action} this user?\n\nReason: ${reason}`;
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-600/20 text-green-300 border border-green-600/30';
      case 'email_verified':
        return 'bg-yellow-600/20 text-yellow-300 border border-yellow-600/30';
      case 'pending':
        return 'bg-gray-600/20 text-gray-300 border border-gray-600/30';
      case 'suspended':
        return 'bg-orange-600/20 text-orange-300 border border-orange-600/30';
      case 'banned':
        return 'bg-red-600/20 text-red-300 border border-red-600/30';
      case 'deleted':
        return 'bg-red-800/20 text-red-400 border border-red-800/30';
      default:
        return 'bg-gray-600/20 text-gray-300 border border-gray-600/30';
    }
  };

  // Get role color
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-600/20 text-purple-300 border border-purple-600/30';
      case 'writer':
        return 'bg-blue-600/20 text-blue-300 border border-blue-600/30';
      case 'reader':
        return 'bg-green-600/20 text-green-300 border border-green-600/30';
      default:
        return 'bg-gray-600/20 text-gray-300 border border-gray-600/30';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format reading time
  const formatReadingTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading users management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <Link href="/admin" className="flex items-center gap-2 sm:gap-3">
                <div className="bg-blue-600 rounded-lg p-2 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center">
                  <span className="text-white font-bold text-sm sm:text-lg">VN</span>
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold">
                    <span className="text-white">Verto</span><span className="text-yellow-400">Note</span>
                  </h1>
                  <p className="text-gray-400 text-xs sm:text-sm">User Management</p>
                </div>
              </Link>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Link 
                href="/admin" 
                className="text-gray-400 hover:text-white transition-colors text-xs sm:text-sm"
              >
                <span className="hidden sm:inline">← Back to Dashboard</span>
                <span className="sm:hidden">← Back</span>
              </Link>
              <button 
                onClick={handleLogout}
                className="bg-red-500/20 text-red-400 px-3 py-1 rounded-lg hover:bg-red-500/30 transition-colors text-xs sm:text-sm"
              >
                🚪 Logout
              </button>
              <div className="text-right hidden sm:block">
                <p className="text-sm text-gray-400">Welcome back,</p>
                <p className="font-semibold">{user?.firstName} {user?.lastName}</p>
              </div>
              <div className="sm:hidden">
                <p className="text-xs font-semibold text-white">{user?.firstName}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Filters and Search */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4 sm:p-6 mb-8">
          {/* Mobile Layout */}
          <div className="flex flex-col gap-4 lg:hidden">
            {/* Search Bar - Full Width */}
            <div className="w-full">
              <input
                type="text"
                placeholder="Search users by name, email, or username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filters and Results Row */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-col xs:flex-row gap-3 w-full sm:w-auto">
                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full xs:w-auto"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="email_verified">Email Verified</option>
                  <option value="approved">Approved</option>
                  <option value="suspended">Suspended</option>
                  <option value="banned">Banned</option>
                </select>

                {/* Role Filter */}
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full xs:w-auto"
                >
                  <option value="">All Roles</option>
                  <option value="reader">Reader</option>
                  <option value="writer">Writer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Results Summary */}
              <div className="text-sm text-gray-400 w-full sm:w-auto text-left sm:text-right">
                {pagination.total > 0 ? (
                  <>
                    <span className="hidden sm:inline">Showing </span>
                    {((pagination.page - 1) * pagination.limit) + 1}-
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                    <span className="hidden sm:inline"> users</span>
                    <span className="sm:hidden"> / {pagination.total}</span>
                  </>
                ) : (
                  'No users found'
                )}
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:flex items-center gap-4 justify-between">
            {/* Search and Filters Row */}
            <div className="flex items-center gap-4 flex-1">
              {/* Search Bar */}
              <div className="flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search users by name, email, or username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="email_verified">Email Verified</option>
                <option value="approved">Approved</option>
                <option value="suspended">Suspended</option>
                <option value="banned">Banned</option>
              </select>

              {/* Role Filter */}
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Roles</option>
                <option value="reader">Reader</option>
                <option value="writer">Writer</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Results Summary */}
            <div className="text-sm text-gray-400">
              {pagination.total > 0 ? (
                <>
                  Showing {((pagination.page - 1) * pagination.limit) + 1}-
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
                </>
              ) : (
                'No users found'
              )}
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 overflow-hidden">
          {/* Loading State */}
          {dataLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
              <span className="ml-2 text-gray-400">Loading users...</span>
            </div>
          )}

          {/* Error State */}
          {error && !dataLoading && (
            <div className="p-6">
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                <p className="text-red-300 text-sm">{error}</p>
                <button 
                  onClick={() => fetchUsers(pagination.page)}
                  className="mt-2 text-red-400 hover:text-red-300 text-sm underline"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Users List */}
          {!dataLoading && !error && (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-700/50">
                    <tr>
                      <th className="text-left p-4 font-medium text-gray-300">User</th>
                      <th className="text-left p-4 font-medium text-gray-300">Role</th>
                      <th className="text-left p-4 font-medium text-gray-300">Status</th>
                      <th className="text-left p-4 font-medium text-gray-300">Activity</th>
                      <th className="text-left p-4 font-medium text-gray-300">Joined</th>
                      <th className="text-left p-4 font-medium text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-gray-400">
                          No users found matching your criteria
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user.id} className="border-t border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                          {/* User Info */}
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="relative w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center overflow-hidden">
                                {user.avatarUrl ? (
                                  <img 
                                    src={user.avatarUrl} 
                                    alt={`${user.firstName} ${user.lastName}`}
                                    className="w-10 h-10 rounded-full object-cover"
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
                                  <span className="text-sm font-bold text-white">
                                    {user.firstName[0]}{user.lastName[0]}
                                  </span>
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-white">
                                  {user.firstName} {user.lastName}
                                </p>
                                <p className="text-sm text-gray-400">{user.email}</p>
                                {user.username && (
                                  <p className="text-xs text-gray-500">@{user.username}</p>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Role */}
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                              {user.role}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                              {user.status.replace('_', ' ')}
                            </span>
                          </td>

                          {/* Activity */}
                          <td className="p-4">
                            <div className="text-sm">
                              <p className="text-white">{user.points} pts • Lvl {user.level}</p>
                              <p className="text-gray-400">
                                {user.articlesRead} articles • {formatReadingTime(user.totalReadingTime)}
                              </p>
                              {user.readingStreak > 0 && (
                                <p className="text-orange-400 text-xs">🔥 {user.readingStreak} day streak</p>
                              )}
                            </div>
                          </td>

                          {/* Joined Date */}
                          <td className="p-4">
                            <div className="text-sm">
                              <p className="text-white">{formatDate(user.createdAt)}</p>
                              {user.lastActiveDate && (
                                <p className="text-gray-400 text-xs">
                                  Last active: {formatDate(user.lastActiveDate)}
                                </p>
                              )}
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="p-4">
                            <div className="flex gap-2 flex-wrap">
                              <button 
                                onClick={() => handleViewUser(user)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                              >
                                View
                              </button>
                              
                              {/* Approval Actions */}
                              {user.status === 'email_verified' && (
                                <>
                                  <button 
                                    onClick={() => openConfirmModal(user, 'approve', 'Registration approved by admin')}
                                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                                  >
                                    Approve
                                  </button>
                                  <button 
                                    onClick={() => openConfirmModal(user, 'reject', 'Registration rejected by admin')}
                                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}

                              {/* Management Actions for Active Users */}
                              {(user.status === 'approved' || user.status === 'suspended') && user.role !== 'admin' && (
                                <>
                                  {user.status === 'approved' && (
                                    <button 
                                      onClick={() => openActionModal(user, 'suspend')}
                                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                                      title="Suspend User"
                                    >
                                      Suspend
                                    </button>
                                  )}
                                  
                                  {user.status === 'suspended' && (
                                    <button 
                                      onClick={() => openConfirmModal(user, 'restore', 'Account unsuspended by admin', 'approved')}
                                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                                      title="Unsuspend User"
                                    >
                                      Unsuspend
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile/Tablet Card View */}
              <div className="lg:hidden space-y-4">
                {users.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    No users found matching your criteria
                  </div>
                ) : (
                  users.map((user) => (
                    <div key={user.id} className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/50">
                      {/* User Header */}
                      <div className="flex items-start gap-3 mb-4">
                        <div className="relative w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                          {user.avatarUrl ? (
                            <img 
                              src={user.avatarUrl} 
                              alt={`${user.firstName} ${user.lastName}`}
                              className="w-12 h-12 rounded-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = `<span class="text-sm font-bold text-white">${user.firstName[0]}${user.lastName[0]}</span>`;
                                }
                              }}
                            />
                          ) : (
                            <span className="text-sm font-bold text-white">
                              {user.firstName[0]}{user.lastName[0]}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-white">
                            {user.firstName} {user.lastName}
                          </h3>
                          <p className="text-sm text-gray-400 break-all">{user.email}</p>
                          {user.username && (
                            <p className="text-xs text-gray-500 mb-2">@{user.username}</p>
                          )}
                          <div className="flex gap-2 flex-wrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                              {user.role}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                              {user.status.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* User Details Grid */}
                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        {/* Activity */}
                        <div>
                          <p className="text-gray-400 text-xs mb-1">Activity</p>
                          <p className="text-white">{user.points} pts • Lvl {user.level}</p>
                          <p className="text-gray-400 text-xs">
                            {user.articlesRead} articles • {formatReadingTime(user.totalReadingTime)}
                          </p>
                          {user.readingStreak > 0 && (
                            <p className="text-orange-400 text-xs">🔥 {user.readingStreak} day streak</p>
                          )}
                        </div>

                        {/* Joined */}
                        <div>
                          <p className="text-gray-400 text-xs mb-1">Joined</p>
                          <p className="text-white">{formatDate(user.createdAt)}</p>
                          {user.lastActiveDate && (
                            <p className="text-gray-400 text-xs">
                              Last: {formatDate(user.lastActiveDate)}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 flex-wrap">
                        <button 
                          onClick={() => handleViewUser(user)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm transition-colors flex-1 sm:flex-none"
                        >
                          View Profile
                        </button>
                        
                        {/* Approval Actions */}
                        {user.status === 'email_verified' && (
                          <>
                            <button 
                              onClick={() => openConfirmModal(user, 'approve', 'Registration approved by admin')}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => openConfirmModal(user, 'reject', 'Registration rejected by admin')}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {/* Management Actions for Active Users */}
                        {(user.status === 'approved' || user.status === 'suspended') && user.role !== 'admin' && (
                          <>
                            {user.status === 'approved' && (
                              <button 
                                onClick={() => openActionModal(user, 'suspend')}
                                className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                                title="Suspend User"
                              >
                                Suspend
                              </button>
                            )}
                            
                            {user.status === 'suspended' && (
                              <button 
                                onClick={() => openConfirmModal(user, 'restore', 'Account unsuspended by admin', 'approved')}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                                title="Unsuspend User"
                              >
                                Unsuspend
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && !dataLoading && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
            <div className="text-sm text-gray-400 order-2 sm:order-1">
              Page {pagination.page} of {pagination.totalPages}
            </div>
            <div className="flex gap-2 order-1 sm:order-2">
              <button
                onClick={() => fetchUsers(pagination.page - 1)}
                disabled={!pagination.hasPrev}
                className="px-3 sm:px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm"
              >
                <span className="hidden sm:inline">Previous</span>
                <span className="sm:hidden">Prev</span>
              </button>
              <button
                onClick={() => fetchUsers(pagination.page + 1)}
                disabled={!pagination.hasNext}
                className="px-3 sm:px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Profile Modal */}
      {selectedUser && (
        <UserProfileModal
          user={{
            ...selectedUser,
            requestedRole: selectedUser.role,
            status: selectedUser.status as 'email_verified',
            registeredAt: selectedUser.createdAt
          }}
          isOpen={showUserModal}
          onClose={handleCloseModal}
          onApprove={handleUserAction}
          onReject={handleUserAction}
        />
      )}

      {/* User Action Modal */}
      {actionModalData && (
        <UserActionModal
          isOpen={showActionModal}
          onClose={closeActionModal}
          onConfirm={handleActionConfirm}
          user={actionModalData.user}
          action={actionModalData.action}
          loading={actionLoading}
        />
      )}

      {/* Action Confirm Modal */}
      {confirmModalData && (
        <ActionConfirmModal
          isOpen={showConfirmModal}
          onClose={closeConfirmModal}
          onConfirm={handleConfirmAction}
          user={confirmModalData.user}
          action={confirmModalData.action}
          customReason={confirmModalData.reason}
          loading={confirmLoading}
        />
      )}
    </div>
  );
}
