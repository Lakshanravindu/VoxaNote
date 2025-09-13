"use client";

import { useState } from 'react';
import { Button } from '@/components/ui';
import { Share2, Facebook, Twitter, Linkedin, MessageCircle, Copy, QrCode } from 'lucide-react';

interface ShareButtonProps {
  articleId: string;
  title: string;
  url: string;
  excerpt?: string;
  onShare?: (type: string) => Promise<void>;
  className?: string;
}

const shareOptions = [
  {
    type: 'facebook',
    label: 'Facebook',
    icon: Facebook,
    color: 'text-blue-600',
    bgColor: 'bg-blue-600/10 hover:bg-blue-600/20'
  },
  {
    type: 'twitter',
    label: 'Twitter',
    icon: Twitter,
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10 hover:bg-blue-400/20'
  },
  {
    type: 'linkedin',
    label: 'LinkedIn',
    icon: Linkedin,
    color: 'text-blue-700',
    bgColor: 'bg-blue-700/10 hover:bg-blue-700/20'
  },
  {
    type: 'whatsapp',
    label: 'WhatsApp',
    icon: MessageCircle,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10 hover:bg-green-500/20'
  },
  {
    type: 'telegram',
    label: 'Telegram',
    icon: MessageCircle,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10 hover:bg-blue-500/20'
  },
  {
    type: 'copy_link',
    label: 'Copy Link',
    icon: Copy,
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/10 hover:bg-gray-500/20'
  },
  {
    type: 'qr_code',
    label: 'QR Code',
    icon: QrCode,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10 hover:bg-purple-500/20'
  }
];

export default function ShareButton({
  articleId,
  title,
  url,
  excerpt,
  onShare,
  className = ''
}: ShareButtonProps) {
  const [showOptions, setShowOptions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleShare = async (type: string) => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      // Call custom share handler if provided
      if (onShare) {
        await onShare(type);
        return;
      }

      // Default sharing logic
      const shareUrl = encodeURIComponent(url);
      const shareTitle = encodeURIComponent(title);
      const shareText = encodeURIComponent(excerpt || title);

      switch (type) {
        case 'facebook':
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`, '_blank');
          break;
        case 'twitter':
          window.open(`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`, '_blank');
          break;
        case 'linkedin':
          window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`, '_blank');
          break;
        case 'whatsapp':
          window.open(`https://wa.me/?text=${shareText}%20${shareUrl}`, '_blank');
          break;
        case 'telegram':
          window.open(`https://t.me/share/url?url=${shareUrl}&text=${shareText}`, '_blank');
          break;
        case 'copy_link':
          await navigator.clipboard.writeText(url);
          // You might want to show a toast notification here
          break;
        case 'qr_code':
          // Generate QR code - you might want to use a QR code library
          console.log('QR Code for:', url);
          break;
      }

      // Track share event
      await fetch(`/api/articles/${articleId}/shares`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shareType: type })
      });

    } catch (error) {
      console.error('Error sharing:', error);
    } finally {
      setIsLoading(false);
      setShowOptions(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Button
        onClick={() => setShowOptions(!showOptions)}
        disabled={isLoading}
        className="flex items-center gap-2"
      >
        <Share2 className="w-4 h-4" />
        Share
        {isLoading && (
          <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
        )}
      </Button>

      {showOptions && (
        <div className="absolute top-12 right-0 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50 min-w-48">
          <div className="p-2">
            <div className="text-xs text-gray-400 mb-2 px-2">Share this article</div>
            <div className="space-y-1">
              {shareOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.type}
                    onClick={() => handleShare(option.type)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${option.bgColor} ${option.color}`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
