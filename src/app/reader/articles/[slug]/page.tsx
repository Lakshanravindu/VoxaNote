"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui';
import { ArrowLeft, Bookmark, Volume2, VolumeX, Settings, MessageCircle } from 'lucide-react';
import ReactionPanel from '@/components/social/ReactionPanel';
import CommentForm from '@/components/social/CommentForm';
import CommentItem from '@/components/social/CommentItem';
import ShareButton from '@/components/social/ShareButton';

interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  category: string;
  readingTime: number;
  publishedAt: string;
  language: 'en' | 'si';
  featuredImage?: string;
  views: number;
  reactionCounts: {
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
  commentsCount: number;
  sharesCount: number;
}

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

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [article, setArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [readingPreferences, setReadingPreferences] = useState({
    fontSize: 16,
    fontFamily: 'sans-serif',
    lineHeight: 1.5,
    theme: 'light',
    width: 'medium'
  });
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    // Mock article data - replace with API call
    const mockArticle: Article = {
      id: '1',
      title: 'Getting Started with Modern Web Development',
      content: `
        <h2>Introduction</h2>
        <p>Modern web development has evolved significantly over the past decade. With the introduction of powerful frameworks, tools, and methodologies, developers can now create more sophisticated and user-friendly applications than ever before.</p>
        
        <h3>Key Technologies</h3>
        <p>Today's web development stack typically includes:</p>
        <ul>
          <li><strong>Frontend Frameworks:</strong> React, Vue.js, Angular</li>
          <li><strong>Backend Technologies:</strong> Node.js, Python, Java</li>
          <li><strong>Databases:</strong> PostgreSQL, MongoDB, Redis</li>
          <li><strong>Cloud Services:</strong> AWS, Google Cloud, Azure</li>
        </ul>
        
        <h3>Best Practices</h3>
        <p>To succeed in modern web development, it's essential to follow industry best practices:</p>
        <ol>
          <li>Write clean, maintainable code</li>
          <li>Implement proper error handling</li>
          <li>Use version control effectively</li>
          <li>Write comprehensive tests</li>
          <li>Optimize for performance</li>
        </ol>
        
        <h3>Conclusion</h3>
        <p>Modern web development offers exciting opportunities for developers. By staying updated with the latest technologies and best practices, you can build amazing applications that provide great user experiences.</p>
      `,
      excerpt: 'Learn the fundamentals of building modern web applications with the latest technologies...',
      author: {
        id: '1',
        name: 'John Smith',
        avatar: '/avatars/john-smith.jpg'
      },
      category: 'Technology',
      readingTime: 8,
      publishedAt: '2024-01-15',
      language: 'en',
      featuredImage: '/images/web-dev.jpg',
      views: 1250,
      reactionCounts: {
        like: 42,
        love: 15,
        wow: 8,
        laugh: 3,
        angry: 1,
        sad: 0
      },
      userReactions: {
        like: false,
        love: true,
        wow: false,
        laugh: false,
        angry: false,
        sad: false
      },
      commentsCount: 8,
      sharesCount: 12
    };

    setArticle(mockArticle);
    
    // Mock comments data
    const mockComments: Comment[] = [
      {
        id: '1',
        content: 'Great article! Very informative and well-written.',
        author: {
          id: '2',
          name: 'Priya Fernando',
          avatar: '/avatars/priya-fernando.jpg'
        },
        createdAt: '2024-01-15T10:30:00Z',
        isEdited: false,
        isDeleted: false,
        reactions: { like: 5, love: 2, wow: 0, laugh: 0, angry: 0, sad: 0 },
        userReactions: { like: false, love: false, wow: false, laugh: false, angry: false, sad: false },
        replies: [
          {
            id: '2',
            content: 'I agree! This really helped me understand the concepts better.',
            author: {
              id: '3',
              name: 'Dr. Sarah Johnson',
              avatar: '/avatars/sarah-johnson.jpg'
            },
            createdAt: '2024-01-15T11:15:00Z',
            isEdited: false,
            isDeleted: false,
            reactions: { like: 2, love: 0, wow: 0, laugh: 0, angry: 0, sad: 0 },
            userReactions: { like: false, love: false, wow: false, laugh: false, angry: false, sad: false }
          }
        ]
      },
      {
        id: '3',
        content: 'Thanks for sharing this! Looking forward to more content like this.',
        author: {
          id: '4',
          name: 'කුමාර ගුණසේකර',
          avatar: '/avatars/kumar-gunasekara.jpg'
        },
        createdAt: '2024-01-15T14:20:00Z',
        isEdited: false,
        isDeleted: false,
        reactions: { like: 3, love: 1, wow: 0, laugh: 0, angry: 0, sad: 0 },
        userReactions: { like: false, love: false, wow: false, laugh: false, angry: false, sad: false }
      }
    ];
    
    setComments(mockComments);
    setLoading(false);
  }, [params.slug]);

  // Load comments when article is loaded
  useEffect(() => {
    if (article && showComments) {
      loadComments();
    }
  }, [article, showComments]);

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // TODO: Implement bookmark API call
  };

  const handleReaction = async (type: string, isActive: boolean) => {
    if (!article) return;
    
    try {
      const response = await fetch(`/api/articles/${article.id}/reactions`, {
        method: isActive ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reactionType: type })
      });
      
      if (response.ok) {
        // Update local state
        setArticle(prev => {
          if (!prev) return prev;
          const newReactionCounts = { ...prev.reactionCounts };
          const newUserReactions = { ...prev.userReactions };
          
          if (isActive) {
            newReactionCounts[type as keyof typeof newReactionCounts] = Math.max(0, newReactionCounts[type as keyof typeof newReactionCounts] - 1);
            newUserReactions[type as keyof typeof newUserReactions] = false;
          } else {
            newReactionCounts[type as keyof typeof newReactionCounts] += 1;
            newUserReactions[type as keyof typeof newUserReactions] = true;
          }
          
          return {
            ...prev,
            reactionCounts: newReactionCounts,
            userReactions: newUserReactions
          };
        });
      }
    } catch (error) {
      console.error('Error updating reaction:', error);
    }
  };

  const handleComment = async (content: string, parentId?: string) => {
    if (!article) return;
    
    try {
      const response = await fetch(`/api/articles/${article.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, parentId })
      });
      
      if (response.ok) {
        // Refresh comments
        loadComments();
        // Update comment count
        setArticle(prev => prev ? { ...prev, commentsCount: prev.commentsCount + 1 } : null);
      }
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const loadComments = async () => {
    if (!article) return;
    
    try {
      const response = await fetch(`/api/articles/${article.id}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.data || []);
      } else {
        console.error('Failed to load comments:', await response.text());
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleShare = async (type: string) => {
    if (!article) return;
    
    try {
      await fetch(`/api/articles/${article.id}/shares`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shareType: type })
      });
      
      // Update share count
      setArticle(prev => prev ? { ...prev, sharesCount: prev.sharesCount + 1 } : null);
    } catch (error) {
      console.error('Error tracking share:', error);
    }
  };

  const handleTextToSpeech = () => {
    if (!article) return;
    
    if (isPlaying) {
      speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(article.content.replace(/<[^>]*>/g, ''));
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      
      speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  };

  const updateReadingPreferences = (key: string, value: any) => {
    setReadingPreferences(prev => ({ ...prev, [key]: value }));
    // TODO: Save to user preferences
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading article...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors ${
      readingPreferences.theme === 'dark' 
        ? 'bg-slate-900 text-white' 
        : readingPreferences.theme === 'reading'
        ? 'bg-amber-50 text-slate-900'
        : 'bg-white text-slate-900'
    }`}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div className="h-6 w-px bg-slate-300 dark:bg-slate-600" />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {article.readingTime} min read
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleTextToSpeech}
                className="flex items-center gap-2"
              >
                {isPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                {isPlaying ? 'Stop' : 'Listen'}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBookmark}
                className={`flex items-center gap-2 ${
                  isBookmarked ? 'text-blue-600' : ''
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                Save
              </Button>
              
              <ShareButton
                articleId={article.id}
                title={article.title}
                url={window.location.href}
                excerpt={article.excerpt}
                onShare={handleShare}
              />
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Reading Settings Panel */}
      {showSettings && (
        <div className="sticky top-16 z-40 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Font Size */}
              <div>
                <label className="block text-sm font-medium mb-2">Font Size</label>
                <input
                  type="range"
                  min="12"
                  max="24"
                  value={readingPreferences.fontSize}
                  onChange={(e) => updateReadingPreferences('fontSize', parseInt(e.target.value))}
                  className="w-full"
                />
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  {readingPreferences.fontSize}px
                </span>
              </div>
              
              {/* Font Family */}
              <div>
                <label className="block text-sm font-medium mb-2">Font Family</label>
                <select
                  value={readingPreferences.fontFamily}
                  onChange={(e) => updateReadingPreferences('fontFamily', e.target.value)}
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                >
                  <option value="sans-serif">Sans Serif</option>
                  <option value="serif">Serif</option>
                  <option value="monospace">Monospace</option>
                </select>
              </div>
              
              {/* Line Height */}
              <div>
                <label className="block text-sm font-medium mb-2">Line Height</label>
                <input
                  type="range"
                  min="1.2"
                  max="2.0"
                  step="0.1"
                  value={readingPreferences.lineHeight}
                  onChange={(e) => updateReadingPreferences('lineHeight', parseFloat(e.target.value))}
                  className="w-full"
                />
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  {readingPreferences.lineHeight}
                </span>
              </div>
              
              {/* Theme */}
              <div>
                <label className="block text-sm font-medium mb-2">Theme</label>
                <select
                  value={readingPreferences.theme}
                  onChange={(e) => updateReadingPreferences('theme', e.target.value)}
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="reading">Reading</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Article Content */}
      <main className="container mx-auto px-6 py-8">
        <article 
          className={`max-w-4xl mx-auto ${
            readingPreferences.width === 'narrow' ? 'max-w-2xl' : 
            readingPreferences.width === 'wide' ? 'max-w-6xl' : 'max-w-4xl'
          }`}
          style={{
            fontSize: `${readingPreferences.fontSize}px`,
            fontFamily: readingPreferences.fontFamily,
            lineHeight: readingPreferences.lineHeight
          }}
        >
          {/* Article Header */}
          <header className="mb-8">
            <div className="flex items-center gap-4 mb-4 text-sm text-slate-600 dark:text-slate-400">
              <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full">
                {article.category}
              </span>
              <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
              <span>{article.views} views</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              {article.title}
            </h1>
            
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                  <span className="text-lg font-semibold">
                    {article.author.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-semibold">{article.author.name}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Author</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowComments(!showComments)}
                  className="flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  {article.commentsCount} Comments
                </Button>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          {article.featuredImage && (
            <div className="mb-8">
              <img
                src={article.featuredImage}
                alt={article.title}
                className="w-full h-64 md:h-96 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Article Content */}
          <div 
            className="prose prose-lg max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Social Features */}
          <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
            {/* Reactions */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Reactions</h3>
              <ReactionPanel
                articleId={article.id}
                initialReactions={article.reactionCounts}
                initialUserReactions={article.userReactions}
                onReaction={handleReaction}
              />
            </div>

            {/* Comments Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  Comments ({article.commentsCount})
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowComments(!showComments)}
                >
                  {showComments ? 'Hide' : 'Show'} Comments
                </Button>
              </div>

              {showComments && (
                <div className="space-y-6">
                  {/* Comment Form */}
                  <CommentForm
                    articleId={article.id}
                    onComment={handleComment}
                    placeholder="Share your thoughts on this article..."
                  />

                  {/* Comments List */}
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <CommentItem
                        key={comment.id}
                        comment={comment}
                        onReply={handleComment}
                        onReaction={async (commentId, type, isActive) => {
                          // TODO: Implement comment reactions
                          console.log('Comment reaction:', commentId, type, isActive);
                        }}
                        currentUserId={user?.id}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </article>
      </main>
    </div>
  );
}
