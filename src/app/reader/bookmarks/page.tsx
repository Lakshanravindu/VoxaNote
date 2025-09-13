"use client";

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Button, Input } from '@/components/ui';
import { Search, Bookmark, Heart, MessageCircle, Clock, User, Trash2, Folder } from 'lucide-react';
import Link from 'next/link';

interface BookmarkedArticle {
  id: string;
  title: string;
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
  likes: number;
  comments: number;
  views: number;
  bookmarkedAt: string;
  folder?: string;
}

export default function BookmarksPage() {
  const { user } = useAuthStore();
  const [bookmarks, setBookmarks] = useState<BookmarkedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [showFolders, setShowFolders] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [folders, setFolders] = useState<string[]>(['Reading List', 'Research', 'Favorites']);

  useEffect(() => {
    // Mock bookmarks data - replace with API call
    const mockBookmarks: BookmarkedArticle[] = [
      {
        id: '1',
        title: 'Getting Started with Modern Web Development',
        excerpt: 'Learn the fundamentals of building modern web applications with the latest technologies and best practices...',
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
        likes: 42,
        comments: 8,
        views: 1250,
        bookmarkedAt: '2024-01-16T10:30:00Z',
        folder: 'Reading List'
      },
      {
        id: '2',
        title: 'Understanding Sri Lankan History',
        excerpt: 'A comprehensive guide to understanding the rich cultural heritage and historical significance of Sri Lanka...',
        author: {
          id: '2',
          name: 'Priya Fernando',
          avatar: '/avatars/priya-fernando.jpg'
        },
        category: 'History',
        readingTime: 12,
        publishedAt: '2024-01-14',
        language: 'en',
        featuredImage: '/images/sri-lanka-history.jpg',
        likes: 28,
        comments: 15,
        views: 890,
        bookmarkedAt: '2024-01-15T14:20:00Z',
        folder: 'Research'
      },
      {
        id: '3',
        title: 'The Future of Artificial Intelligence',
        excerpt: 'Exploring the potential impact of AI on various industries and how it will shape our future...',
        author: {
          id: '3',
          name: 'Dr. Sarah Johnson',
          avatar: '/avatars/sarah-johnson.jpg'
        },
        category: 'Science',
        readingTime: 15,
        publishedAt: '2024-01-13',
        language: 'en',
        featuredImage: '/images/ai-future.jpg',
        likes: 67,
        comments: 23,
        views: 2100,
        bookmarkedAt: '2024-01-14T09:15:00Z',
        folder: 'Favorites'
      }
    ];

    setBookmarks(mockBookmarks);
    setLoading(false);
  }, []);

  const filteredBookmarks = bookmarks.filter(bookmark => {
    const matchesSearch = bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         bookmark.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         bookmark.author.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFolder = selectedFolder === 'all' || bookmark.folder === selectedFolder;
    
    return matchesSearch && matchesFolder;
  });

  const handleRemoveBookmark = (articleId: string) => {
    setBookmarks(prev => prev.filter(bookmark => bookmark.id !== articleId));
    // TODO: Implement remove bookmark API call
  };

  const handleMoveToFolder = (articleId: string, folder: string) => {
    setBookmarks(prev => prev.map(bookmark => 
      bookmark.id === articleId 
        ? { ...bookmark, folder }
        : bookmark
    ));
    // TODO: Implement move to folder API call
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim() && !folders.includes(newFolderName.trim())) {
      setFolders(prev => [...prev, newFolderName.trim()]);
      setNewFolderName('');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading bookmarks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/50">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Bookmarks</h1>
              <p className="text-gray-400">Your saved articles and reading lists</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setShowFolders(!showFolders)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Folder className="w-4 h-4" />
                Manage Folders
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search your bookmarks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 w-full bg-slate-700/50 border-slate-600 text-white placeholder-gray-400"
            />
          </div>
        </div>
      </header>

      {/* Folders Management */}
      {showFolders && (
        <div className="bg-slate-800/30 backdrop-blur-xl border-b border-slate-700/50">
          <div className="container mx-auto px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Create New Folder */}
              <div>
                <label className="block text-sm font-medium mb-2">Create New Folder</label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Folder name"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                  <Button onClick={handleCreateFolder} size="sm">
                    Create
                  </Button>
                </div>
              </div>

              {/* Folder Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Filter by Folder</label>
                <select
                  value={selectedFolder}
                  onChange={(e) => setSelectedFolder(e.target.value)}
                  className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white"
                >
                  <option value="all">All Folders</option>
                  {folders.map(folder => (
                    <option key={folder} value={folder}>
                      {folder}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bookmarks Grid */}
      <main className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <p className="text-gray-400">
            {filteredBookmarks.length} bookmarked articles
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBookmarks.map((bookmark) => (
            <article
              key={bookmark.id}
              className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden hover:border-slate-600/50 transition-all duration-300 group"
            >
              {/* Featured Image */}
              {bookmark.featuredImage && (
                <div className="aspect-video bg-slate-700 overflow-hidden">
                  <img
                    src={bookmark.featuredImage}
                    alt={bookmark.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}

              <div className="p-6">
                {/* Category & Language */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded-full text-xs font-medium">
                      {bookmark.category}
                    </span>
                    <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded-full text-xs">
                      {bookmark.language.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-green-600/20 text-green-400 px-2 py-1 rounded-full text-xs">
                      {bookmark.folder}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveBookmark(bookmark.id)}
                      className="p-1 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-blue-400 transition-colors">
                  <Link href={`/reader/articles/${bookmark.id}`}>
                    {bookmark.title}
                  </Link>
                </h2>

                {/* Excerpt */}
                <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                  {bookmark.excerpt}
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold">
                      {bookmark.author.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{bookmark.author.name}</p>
                    <p className="text-xs text-gray-500">
                      Bookmarked {new Date(bookmark.bookmarkedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Stats & Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {bookmark.readingTime}m
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {bookmark.views}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-2 text-gray-400"
                    >
                      <Heart className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-2 text-blue-500"
                    >
                      <Bookmark className="w-4 h-4 fill-current" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-2 text-gray-400"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Move to Folder */}
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <select
                    value={bookmark.folder || ''}
                    onChange={(e) => handleMoveToFolder(bookmark.id, e.target.value)}
                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                  >
                    {folders.map(folder => (
                      <option key={folder} value={folder}>
                        Move to {folder}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </article>
          ))}
        </div>

        {filteredBookmarks.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔖</div>
            <h3 className="text-xl font-semibold mb-2">
              {searchQuery ? 'No bookmarks found' : 'No bookmarks yet'}
            </h3>
            <p className="text-gray-400 mb-6">
              {searchQuery 
                ? 'Try adjusting your search criteria'
                : 'Start bookmarking articles you want to read later'
              }
            </p>
            {searchQuery && (
              <Button onClick={() => setSearchQuery('')}>
                Clear Search
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
