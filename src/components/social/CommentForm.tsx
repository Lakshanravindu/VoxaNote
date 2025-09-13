"use client";

import { useState, useRef } from 'react';
import { Button } from '@/components/ui';
import { Send, AtSign } from 'lucide-react';

interface CommentFormProps {
  articleId: string;
  parentId?: string;
  onComment: (content: string, parentId?: string) => Promise<void>;
  placeholder?: string;
  className?: string;
}

export default function CommentForm({
  articleId,
  parentId,
  onComment,
  placeholder = "Write a comment...",
  className = ''
}: CommentFormProps) {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() || isLoading) return;
    
    setIsLoading(true);
    
    try {
      await onComment(content.trim(), parentId);
      setContent('');
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleMention = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = content.slice(0, start) + '@' + content.slice(end);
    
    setContent(newContent);
    setShowMentions(false);
    
    // Focus back to textarea
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + 1, start + 1);
    }, 0);
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-3 ${className}`}>
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
          disabled={isLoading}
        />
        
        {/* Mention button */}
        <button
          type="button"
          onClick={handleMention}
          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-blue-400 transition-colors"
          title="Mention user (@username)"
        >
          <AtSign className="w-4 h-4" />
        </button>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-400">
          Press Ctrl+Enter to submit
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setContent('')}
            disabled={isLoading || !content.trim()}
            className="text-gray-400 hover:text-white"
          >
            Cancel
          </Button>
          
          <Button
            type="submit"
            size="sm"
            disabled={isLoading || !content.trim()}
            className="flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            {isLoading ? 'Posting...' : 'Post Comment'}
          </Button>
        </div>
      </div>
    </form>
  );
}
