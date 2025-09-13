'use client';

import { useEffect, useState } from 'react';

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

export default function Toast({ 
  id, 
  type, 
  title, 
  message, 
  duration = 5000, 
  onClose 
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    // Animate in
    const showTimer = setTimeout(() => setIsVisible(true), 50);
    
    // Auto close
    const closeTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(closeTimer);
    };
  }, [duration]);

  const handleClose = () => {
    setIsRemoving(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  };

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          bgColor: 'bg-green-800/90',
          borderColor: 'border-green-600',
          icon: '✅',
          iconBg: 'bg-green-600'
        };
      case 'error':
        return {
          bgColor: 'bg-red-800/90',
          borderColor: 'border-red-600',
          icon: '❌',
          iconBg: 'bg-red-600'
        };
      case 'warning':
        return {
          bgColor: 'bg-yellow-800/90',
          borderColor: 'border-yellow-600',
          icon: '⚠️',
          iconBg: 'bg-yellow-600'
        };
      case 'info':
        return {
          bgColor: 'bg-blue-800/90',
          borderColor: 'border-blue-600',
          icon: 'ℹ️',
          iconBg: 'bg-blue-600'
        };
    }
  };

  const config = getToastConfig();

  return (
    <div
      className={`
        z-50 max-w-sm w-full mx-auto
        transform transition-all duration-300 ease-out
        ${isVisible && !isRemoving 
          ? 'translate-y-0 opacity-100 scale-100' 
          : '-translate-y-8 opacity-0 scale-95'
        }
      `}
    >
      <div className={`
        ${config.bgColor} backdrop-blur-sm
        border ${config.borderColor}
        rounded-lg shadow-2xl p-4
        text-white
      `}>
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`
            ${config.iconBg} 
            rounded-full p-1 flex-shrink-0
            flex items-center justify-center
            text-sm
          `}>
            {config.icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm mb-1">
              {title}
            </h4>
            {message && (
              <p className="text-sm text-white/90 leading-relaxed">
                {message}
              </p>
            )}
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="flex-shrink-0 text-white/60 hover:text-white transition-colors p-1"
            aria-label="Close notification"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 h-1 bg-white/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-white/60 rounded-full animate-toast-progress"
            style={{ 
              animationDuration: `${duration}ms`,
              animationTimingFunction: 'linear'
            }}
          />
        </div>
      </div>
    </div>
  );
}
