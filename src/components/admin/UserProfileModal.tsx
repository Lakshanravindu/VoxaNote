"use client";

import { useState } from 'react';
import { useToast } from '@/components/ui/ToastManager';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username?: string;
  requestedRole: 'reader' | 'writer';
  status: 'email_verified';
  registeredAt: string;
  avatarUrl?: string;
  bio?: string;
  country?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
  defaultLanguage?: string;
}

interface UserProfileModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (userId: string, approved: boolean, reason?: string) => Promise<void>;
  onReject: (userId: string, approved: boolean, reason?: string) => Promise<void>;
}

export default function UserProfileModal({ 
  user, 
  isOpen, 
  onClose, 
  onApprove, 
  onReject 
}: UserProfileModalProps) {
  const { showError } = useToast();
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await onApprove(user.id, true);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      showError(
        'Rejection reason required',
        'Please provide a reason for rejecting this user registration.'
      );
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onReject(user.id, false, rejectReason.trim());
      setShowRejectModal(false);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleColor = (role: 'reader' | 'writer') => {
    return role === 'writer' 
      ? 'bg-purple-600/20 text-purple-300 border border-purple-600/30'
      : 'bg-green-600/20 text-green-300 border border-green-600/30';
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Main Profile Modal */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700">
            <h2 className="text-xl font-semibold text-white">User Profile Review</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Profile Header */}
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center overflow-hidden">
                {user.avatarUrl ? (
                  <img 
                    src={user.avatarUrl} 
                    alt={`${user.firstName} ${user.lastName}`}
                    className="w-16 h-16 rounded-full object-cover"
                    onError={(e) => {
                      // Fallback to initials if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `<span class="text-xl font-bold text-white">${user.firstName[0]}${user.lastName[0]}</span>`;
                      }
                    }}
                  />
                ) : (
                  <span className="text-xl font-bold text-white">
                    {user.firstName[0]}{user.lastName[0]}
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">
                  {user.firstName} {user.lastName}
                </h3>
                <p className="text-gray-400">{user.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user.requestedRole)}`}>
                    {user.requestedRole}
                  </span>
                  <span className="text-xs text-gray-500">
                    Registered: {formatDate(user.registeredAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-white border-b border-slate-700 pb-2">
                  Basic Information
                </h4>
                
                <div>
                  <label className="text-sm text-gray-400">Username</label>
                  <p className="text-white">{user.username || 'Not set'}</p>
                </div>

                <div>
                  <label className="text-sm text-gray-400">Country</label>
                  <p className="text-white">{user.country || 'Not specified'}</p>
                </div>

                <div>
                  <label className="text-sm text-gray-400">Default Language</label>
                  <p className="text-white">
                    {user.defaultLanguage === 'si' ? 'Sinhala' : 
                     user.defaultLanguage === 'en' ? 'English' : 'Not set'}
                  </p>
                </div>
              </div>

              {/* Social Links */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-white border-b border-slate-700 pb-2">
                  Social Media Links
                </h4>
                
                {user.socialLinks && Object.keys(user.socialLinks).length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(user.socialLinks).map(([platform, url]) => {
                      if (!url) return null;
                      
                      // Map platform names to display labels
                      const platformLabels: Record<string, string> = {
                        facebook: 'Facebook',
                        twitter: 'Twitter', 
                        linkedin: 'LinkedIn',
                        instagram: 'Instagram',
                        main: 'Social Media Profile',
                        website: 'Website',
                        blog: 'Blog',
                        youtube: 'YouTube',
                        tiktok: 'TikTok'
                      };
                      
                      const displayLabel = platformLabels[platform.toLowerCase()] || 
                                          platform.charAt(0).toUpperCase() + platform.slice(1);
                      
                      return (
                        <div key={platform}>
                          <label className="text-sm text-gray-400">{displayLabel}</label>
                          <a 
                            href={url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="block text-blue-400 hover:text-blue-300 transition-colors break-all"
                          >
                            {url}
                          </a>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No social media links provided</p>
                )}
              </div>
            </div>

            {/* Bio Section */}
            {user.bio && (
              <div>
                <h4 className="text-lg font-medium text-white border-b border-slate-700 pb-2 mb-3">
                  Bio
                </h4>
                <p className="text-gray-300 leading-relaxed">{user.bio}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                disabled={isSubmitting}
              >
                Close
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                disabled={isSubmitting}
              >
                Reject
              </button>
              <button
                onClick={handleApprove}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Rejection Reason Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-60 p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Reject User Registration
              </h3>
              <p className="text-gray-400 mb-4">
                Please provide a reason for rejecting this user's registration. This will be sent to the user via email.
              </p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g., We couldn't verify your Facebook profile. Please ensure your profile is public or provide additional verification."
                className="w-full h-32 bg-slate-700 border border-slate-600 rounded-lg p-3 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectReason('');
                  }}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  disabled={isSubmitting || !rejectReason.trim()}
                >
                  {isSubmitting ? 'Rejecting...' : 'Reject User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
