"use client";

import { useState } from 'react';
import { Heart, Smile, Laugh, Frown, Angry, Meh } from 'lucide-react';

interface ReactionButtonProps {
  articleId: string;
  reactionType: 'like' | 'love' | 'wow' | 'laugh' | 'angry' | 'sad';
  count: number;
  isActive: boolean;
  onReaction: (type: string, isActive: boolean) => void;
  disabled?: boolean;
}

const reactionConfig = {
  like: {
    icon: Heart,
    label: 'Like',
    color: 'text-red-500',
    activeColor: 'text-red-500',
    bgColor: 'bg-red-500/10',
    activeBgColor: 'bg-red-500/20'
  },
  love: {
    icon: Heart,
    label: 'Love',
    color: 'text-pink-500',
    activeColor: 'text-pink-500',
    bgColor: 'bg-pink-500/10',
    activeBgColor: 'bg-pink-500/20'
  },
  wow: {
    icon: Smile,
    label: 'Wow',
    color: 'text-yellow-500',
    activeColor: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    activeBgColor: 'bg-yellow-500/20'
  },
  laugh: {
    icon: Laugh,
    label: 'Laugh',
    color: 'text-green-500',
    activeColor: 'text-green-500',
    bgColor: 'bg-green-500/10',
    activeBgColor: 'bg-green-500/20'
  },
  angry: {
    icon: Angry,
    label: 'Angry',
    color: 'text-orange-500',
    activeColor: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    activeBgColor: 'bg-orange-500/20'
  },
  sad: {
    icon: Frown,
    label: 'Sad',
    color: 'text-blue-500',
    activeColor: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    activeBgColor: 'bg-blue-500/20'
  }
};

export default function ReactionButton({
  articleId,
  reactionType,
  count,
  isActive,
  onReaction,
  disabled = false
}: ReactionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const config = reactionConfig[reactionType];
  const Icon = config.icon;

  const handleClick = async () => {
    if (disabled || isLoading) return;
    
    setIsLoading(true);
    try {
      await onReaction(reactionType, isActive);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={`
        flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200
        ${isActive 
          ? `${config.activeColor} ${config.activeBgColor} border border-current/20` 
          : `${config.color} ${config.bgColor} hover:${config.bgColor}`
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 cursor-pointer'}
        ${isLoading ? 'opacity-70' : ''}
      `}
    >
      <Icon 
        className={`w-4 h-4 ${isActive ? 'fill-current' : ''}`} 
      />
      <span className="text-sm font-medium">
        {count > 0 ? count : ''}
      </span>
      {isLoading && (
        <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
      )}
    </button>
  );
}
