'use client';

import { useState } from 'react';

interface UserActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  action: 'suspend' | 'ban' | 'delete';
  loading?: boolean;
}

export default function UserActionModal({
  isOpen,
  onClose,
  onConfirm,
  user,
  action,
  loading = false
}: UserActionModalProps) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const getActionConfig = () => {
    switch (action) {
      case 'suspend':
        return {
          title: 'Suspend User',
          description: 'This will temporarily suspend the user\'s account',
          buttonText: 'Suspend User',
          buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
          icon: '⏸️',
          consequences: [
            'User cannot access their account',
            'Content remains visible but user cannot interact',
            'User will receive an email notification',
            'Action can be reversed by restoring the user'
          ],
          defaultReasons: [
            'Violation of community guidelines',
            'Inappropriate content or behavior',
            'Spam or promotional activity',
            'Multiple user reports',
            'Investigation pending'
          ]
        };
      case 'ban':
        return {
          title: 'Ban User',
          description: 'This will permanently ban the user from the platform',
          buttonText: 'Ban User',
          buttonColor: 'bg-red-600 hover:bg-red-700',
          icon: '🚫',
          consequences: [
            'User cannot access the platform',
            'All content becomes hidden',
            'User will receive an email notification',
            'Action can be reversed by unbanning'
          ],
          defaultReasons: [
            'Serious violation of terms of service',
            'Harassment or abusive behavior',
            'Repeated policy violations',
            'Fraudulent or malicious activity',
            'Legal compliance requirement'
          ]
        };
      case 'delete':
        return {
          title: 'Delete User',
          description: 'This will soft delete the user account',
          buttonText: 'Delete User',
          buttonColor: 'bg-red-800 hover:bg-red-900',
          icon: '🗑️',
          consequences: [
            'User account will be deactivated',
            'All content will be hidden',
            'User data preserved for recovery',
            'User will receive an email notification',
            'Action can be reversed by restoring'
          ],
          defaultReasons: [
            'User requested account deletion',
            'Duplicate or fake account',
            'Severe terms of service violation',
            'Data protection compliance',
            'Legal requirement'
          ]
        };
    }
  };

  const config = getActionConfig();

  const handleSubmit = async () => {
    if (!reason.trim()) {
      alert('Please provide a reason for this action');
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(reason.trim());
      setReason('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  const selectDefaultReason = (defaultReason: string) => {
    setReason(defaultReason);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-6 rounded-t-xl border-b border-slate-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{config.icon}</span>
              <div>
                <h2 className="text-xl font-bold text-white">{config.title}</h2>
                <p className="text-slate-300 text-sm">{config.description}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-slate-400 hover:text-white transition-colors"
              disabled={isSubmitting || loading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* User Info */}
          <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
            <h3 className="text-white font-medium mb-2">Target User:</h3>
            <div className="text-slate-300">
              <p><span className="font-medium">Name:</span> {user.firstName} {user.lastName}</p>
              <p><span className="font-medium">Email:</span> {user.email}</p>
            </div>
          </div>

          {/* Consequences */}
          <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-4">
            <h3 className="text-red-300 font-medium mb-3 flex items-center gap-2">
              <span>⚠️</span>
              What will happen:
            </h3>
            <ul className="space-y-2 text-red-200 text-sm">
              {config.consequences.map((consequence, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">•</span>
                  <span>{consequence}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Reason Input */}
          <div className="space-y-4">
            <div>
              <label className="block text-white font-medium mb-2">
                Reason for {action} <span className="text-red-400">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={`Please provide a detailed reason for ${action}ing this user...`}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[100px] resize-vertical"
                disabled={isSubmitting || loading}
              />
              <p className="text-slate-400 text-sm mt-1">
                This reason will be included in the email notification to the user.
              </p>
            </div>

            {/* Quick Reason Buttons */}
            <div className="space-y-2">
              <p className="text-slate-300 text-sm font-medium">Quick reasons:</p>
              <div className="flex flex-wrap gap-2">
                {config.defaultReasons.map((defaultReason, index) => (
                  <button
                    key={index}
                    onClick={() => selectDefaultReason(defaultReason)}
                    className="bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white px-3 py-1 rounded-lg text-sm transition-colors border border-slate-600"
                    disabled={isSubmitting || loading}
                  >
                    {defaultReason}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Character Counter */}
          <div className="text-right">
            <span className={`text-sm ${reason.length > 500 ? 'text-red-400' : 'text-slate-400'}`}>
              {reason.length}/500 characters
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-700/50 p-6 rounded-b-xl border-t border-slate-600">
          <div className="flex justify-end gap-3">
            <button
              onClick={handleClose}
              className="px-6 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
              disabled={isSubmitting || loading}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!reason.trim() || reason.length > 500 || isSubmitting || loading}
              className={`px-6 py-2 ${config.buttonColor} text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
            >
              {(isSubmitting || loading) && (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {config.buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
