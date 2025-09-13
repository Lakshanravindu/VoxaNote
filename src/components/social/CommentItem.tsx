"use client";

import { useState } from 'react';
import { Button } from '@/components/ui';
import { Heart, Reply, MoreVertical, Edit, Trash2, Flag } from 'lucide-react';
import ReactionButton from './ReactionButton';
import CommentForm from './CommentForm';

interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  isEdited: boolean;
  editedAt?: string;
  isDeleted: boolean;
  reactions: {
    like: number;
    love: number;
    wow: number;
    laugh: number;
    angry: number;
    sad: number;
  };
  userReactions: {
    like: boolean;
    love: boolean;
    wow: boolean;
    laugh: boolean;
    angry: boolean;
    sad: boolean;
  };
  replies?: Comment[];
}

interface CommentItemProps {
  comment: Comment;
  onReply: (content: string, parentId: string) => Promise<void>;
  onReaction: (commentId: string, type: string, isActive: boolean) => Promise<void>;
  onEdit?: (commentId: string, content: string) => Promise<void>;
  onDelete?: (commentId: string) => Promise<void>;
  onReport?: (commentId: string) => Promise<void>;
  currentUserId?: string;
  level?: number;
  maxLevel?: number;
}

export default function CommentItem({
  comment,
  onReply,
  onReaction,
  onEdit,
  onDelete,
  onReport,
  currentUserId,
  level = 0,
  maxLevel = 3
}: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showActions, setShowActions] = useState(false);

  const canReply = level < maxLevel;
  const canEdit = currentUserId === comment.author.id;
  const canDelete = currentUserId === comment.author.id;
  const canReport = currentUserId !== comment.author.id;

  const handleReply = async (content: string, parentId: string) => {
    try {
      await onReply(content, parentId);
      setShowReplyForm(false);
    } catch (error) {
      console.error('Error replying to comment:', error);
    }
  };

  const handleEdit = async () => {
    if (!onEdit) return;
    
    try {
      await onEdit(comment.id, editContent);
      setIsEditing(false);
    } catch (error) {
      console.error('Error editing comment:', error);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    try {
      await onDelete(comment.id);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleReport = async () => {
    if (!onReport) return;
    
    try {
      await onReport(comment.id);
      setShowActions(false);
    } catch (error) {
      console.error('Error reporting comment:', error);
    }
  };

  if (comment.isDeleted) {
    return (
      <div className={`p-3 bg-slate-800/30 rounded-lg border border-slate-700/50 ${level > 0 ? 'ml-4' : ''}`}>
        <p className="text-gray-500 italic text-sm">This comment has been deleted.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${level > 0 ? 'ml-4 border-l border-slate-700/50 pl-4' : ''}`}>
      {/* Comment Content */}
      <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
        {/* Comment Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-slate-600 rounded-full flex items-center justify-center">
              <span className="text-xs font-semibold">
                {comment.author.avatar ? (
                  <img
                    src={comment.author.avatar}
                    alt={comment.author.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  comment.author.name.charAt(0)
                )}
              </span>
            </div>
            <div>
              <span className="text-sm font-medium text-white">{comment.author.name}</span>
              <span className="text-xs text-gray-400 ml-2">
                {new Date(comment.createdAt).toLocaleDateString()}
                {comment.isEdited && (
                  <span className="ml-1">(edited)</span>
                )}
              </span>
            </div>
          </div>
          
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowActions(!showActions)}
              className="p-1 text-gray-400 hover:text-white"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
            
            {showActions && (
              <div className="absolute right-0 top-8 bg-slate-700 border border-slate-600 rounded-lg shadow-lg z-10 min-w-32">
                {canEdit && (
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setShowActions(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-slate-600 flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={handleDelete}
                    className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-slate-600 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                )}
                {canReport && (
                  <button
                    onClick={handleReport}
                    className="w-full px-3 py-2 text-left text-sm text-orange-400 hover:bg-slate-600 flex items-center gap-2"
                  >
                    <Flag className="w-4 h-4" />
                    Report
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Comment Text */}
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white text-sm resize-none"
              rows={3}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleEdit}
                disabled={!editContent.trim()}
              >
                Save
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(comment.content);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-300 whitespace-pre-wrap">{comment.content}</p>
        )}

        {/* Comment Actions */}
        {!isEditing && (
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-700/50">
            {/* Reactions */}
            <div className="flex items-center gap-1">
              <ReactionButton
                articleId={comment.id}
                reactionType="like"
                count={comment.reactions.like}
                isActive={comment.userReactions.like}
                onReaction={(type, isActive) => onReaction(comment.id, type, isActive)}
              />
            </div>

            {/* Reply Button */}
            {canReply && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="text-gray-400 hover:text-white flex items-center gap-1"
              >
                <Reply className="w-4 h-4" />
                Reply
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Reply Form */}
      {showReplyForm && canReply && (
        <CommentForm
          articleId={comment.id}
          parentId={comment.id}
          onComment={handleReply}
          placeholder={`Reply to ${comment.author.name}...`}
        />
      )}

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onReaction={onReaction}
              onEdit={onEdit}
              onDelete={onDelete}
              onReport={onReport}
              currentUserId={currentUserId}
              level={level + 1}
              maxLevel={maxLevel}
            />
          ))}
        </div>
      )}
    </div>
  );
}
