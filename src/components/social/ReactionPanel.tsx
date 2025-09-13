"use client";

import { useState, useEffect } from 'react';
import ReactionButton from './ReactionButton';

interface ReactionData {
  like: number;
  love: number;
  wow: number;
  laugh: number;
  angry: number;
  sad: number;
}

interface UserReactions {
  like: boolean;
  love: boolean;
  wow: boolean;
  laugh: boolean;
  angry: boolean;
  sad: boolean;
}

interface ReactionPanelProps {
  articleId: string;
  initialReactions?: ReactionData;
  initialUserReactions?: UserReactions;
  onReaction?: (type: string, isActive: boolean) => Promise<void>;
  className?: string;
}

export default function ReactionPanel({
  articleId,
  initialReactions = { like: 0, love: 0, wow: 0, laugh: 0, angry: 0, sad: 0 },
  initialUserReactions = { like: false, love: false, wow: false, laugh: false, angry: false, sad: false },
  onReaction,
  className = ''
}: ReactionPanelProps) {
  const [reactions, setReactions] = useState<ReactionData>(initialReactions);
  const [userReactions, setUserReactions] = useState<UserReactions>(initialUserReactions);
  const [isLoading, setIsLoading] = useState(false);

  const handleReaction = async (type: string, isActive: boolean) => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      // Optimistic update
      const newUserReactions = { ...userReactions, [type]: !isActive };
      setUserReactions(newUserReactions);
      
      const newReactions = { ...reactions };
      if (!isActive) {
        // Adding reaction
        newReactions[type as keyof ReactionData] += 1;
      } else {
        // Removing reaction
        newReactions[type as keyof ReactionData] = Math.max(0, newReactions[type as keyof ReactionData] - 1);
      }
      setReactions(newReactions);

      // Call API
      if (onReaction) {
        await onReaction(type, isActive);
      } else {
        // Default API call
        await fetch(`/api/articles/${articleId}/reactions`, {
          method: isActive ? 'DELETE' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reactionType: type })
        });
      }
    } catch (error) {
      console.error('Error updating reaction:', error);
      // Revert optimistic update
      setUserReactions(initialUserReactions);
      setReactions(initialReactions);
    } finally {
      setIsLoading(false);
    }
  };

  const reactionTypes: (keyof ReactionData)[] = ['like', 'love', 'wow', 'laugh', 'angry', 'sad'];

  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      {reactionTypes.map((type) => (
        <ReactionButton
          key={type}
          articleId={articleId}
          reactionType={type}
          count={reactions[type]}
          isActive={userReactions[type]}
          onReaction={handleReaction}
          disabled={isLoading}
        />
      ))}
    </div>
  );
}
