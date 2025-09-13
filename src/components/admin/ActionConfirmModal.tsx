'use client';

import { useState } from 'react';

interface ActionConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  action: 'unban' | 'restore' | 'approve' | 'reject' | 'activate' | 'deactivate';
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  loading?: boolean;
  customReason?: string;
}

export default function ActionConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  action,
  user,
  loading = false,
  customReason
}: ActionConfirmModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const getActionConfig = () => {
    switch (action) {
      case 'unban':
        return {
          title: 'Unban User',
          description: 'This will restore user access to the platform',
          buttonText: 'Unban User',
          buttonColor: 'bg-green-600 hover:bg-green-700',
          icon: '✅',
          iconBg: 'bg-green-600',
          consequences: [
            'User can access their account again',
            'All platform features will be available',
            'User will receive a restoration email',
            'Previous ban record will remain in audit log'
          ],
          defaultReason: 'Account unbanned by admin'
        };
      case 'restore':
        return {
          title: 'Unsuspend User',
          description: 'This will unsuspend the user account',
          buttonText: 'Unsuspend User',
          buttonColor: 'bg-green-600 hover:bg-green-700',
          icon: '✅',
          iconBg: 'bg-green-600',
          consequences: [
            'User can access their account again',
            'All platform features will be available',
            'User will receive an unsuspension email',
            'Account status will change to approved'
          ],
          defaultReason: 'Account unsuspended by admin'
        };
      case 'approve':
        return {
          title: 'Approve User',
          description: 'This will approve the user registration',
          buttonText: 'Approve User',
          buttonColor: 'bg-green-600 hover:bg-green-700',
          icon: '✅',
          iconBg: 'bg-green-600',
          consequences: [
            'User can access the platform',
            'Welcome email will be sent',
            'Account status changes to approved',
            'User can start using all features'
          ],
          defaultReason: 'Registration approved by admin'
        };
      case 'reject':
        return {
          title: 'Reject User',
          description: 'This will reject the user registration',
          buttonText: 'Reject User',
          buttonColor: 'bg-red-600 hover:bg-red-700',
          icon: '❌',
          iconBg: 'bg-red-600',
          consequences: [
            'User registration will be denied',
            'Rejection email will be sent with reason',
            'User cannot access the platform',
            'Account remains in rejected state'
          ],
          defaultReason: 'Registration rejected by admin'
        };
      case 'activate':
        return {
          title: 'Activate User',
          description: 'This will activate the user account',
          buttonText: 'Activate User',
          buttonColor: 'bg-green-600 hover:bg-green-700',
          icon: '🟢',
          iconBg: 'bg-green-600',
          consequences: [
            'User account becomes active',
            'User can access all features',
            'Activation email will be sent',
            'Account status changes to approved'
          ],
          defaultReason: 'Account activated by admin'
        };
      case 'deactivate':
        return {
          title: 'Deactivate User',
          description: 'This will temporarily deactivate the user account',
          buttonText: 'Deactivate User',
          buttonColor: 'bg-orange-600 hover:bg-orange-700',
          icon: '⏸️',
          iconBg: 'bg-orange-600',
          consequences: [
            'User cannot access their account',
            'Content remains visible',
            'Deactivation email will be sent',
            'Action can be reversed'
          ],
          defaultReason: 'Account deactivated by admin'
        };
    }
  };

  const config = getActionConfig();

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-6 rounded-t-xl border-b border-slate-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`${config.iconBg} rounded-full p-2 flex items-center justify-center text-lg`}>
                {config.icon}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{config.title}</h2>
                <p className="text-slate-300 text-sm">{config.description}</p>
              </div>
            </div>
            <button
              onClick={onClose}
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

          {/* Custom Reason Display */}
          {customReason && (
            <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-4">
              <h3 className="text-blue-300 font-medium mb-2 flex items-center gap-2">
                <span>ℹ️</span>
                Reason:
              </h3>
              <p className="text-blue-200 text-sm">{customReason}</p>
            </div>
          )}

          {/* Consequences */}
          <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-4">
            <h3 className="text-slate-200 font-medium mb-3 flex items-center gap-2">
              <span>📋</span>
              What will happen:
            </h3>
            <ul className="space-y-2 text-slate-300 text-sm">
              {config.consequences.map((consequence, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-slate-400 mt-1">•</span>
                  <span>{consequence}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Confirmation Question */}
          <div className="bg-yellow-900/20 border border-yellow-800/30 rounded-lg p-4">
            <p className="text-yellow-200 text-center font-medium">
              Are you sure you want to {action} this user?
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-700/50 p-6 rounded-b-xl border-t border-slate-600">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
              disabled={isSubmitting || loading}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isSubmitting || loading}
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
