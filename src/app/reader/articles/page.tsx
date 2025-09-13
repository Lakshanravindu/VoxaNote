"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Button, Input } from '@/components/ui';
import { Search, Filter, Bookmark, Heart, MessageCircle, Clock, User, Share2 } from 'lucide-react';
import Link from 'next/link';
import ShareButton from '@/components/social/ShareButton';

interface Article {
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
  shares?: number;
  isBookmarked?: boolean;
  isLiked?: boolean;
}

export default function ArticlesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    'All', 'Technology', 'History', 'Culture', 'Science', 'Health', 'Business', 'Lifestyle'
  ];

  const languages = [
    { value: 'all', label: 'All Languages' },
    { value: 'en', label: 'English' },
    { value: 'si', label: 'Sinhala' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'reading_time', label: 'Reading Time' }
  ];

  useEffect(() => {
    // Mock articles data - replace with API call
    const mockArticles: Article[] = [
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
        shares: 12,
        isBookmarked: false,
        isLiked: false
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
        shares: 8,
        isBookmarked: true,
        isLiked: true
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
        shares: 25,
        isBookmarked: false,
        isLiked: false
      },
      {
        id: '4',
        title: 'සිංහල සාහිත්‍යයේ අනාගතය',
        excerpt: 'සිංහල සාහිත්‍යයේ වර්තමාන තත්වය සහ අනාගත දිශාව පිළිබඳ සවිස්තරාත්මක විග්‍රහයක්...',
        author: {
          id: '4',
          name: 'කුමාර ගුණසේකර',
          avatar: '/avatars/kumar-gunasekara.jpg'
        },
        category: 'Culture',
        readingTime: 10,
        publishedAt: '2024-01-12',
        language: 'si',
        featuredImage: '/images/sinhala-literature.jpg',
        likes: 35,
        comments: 12,
        views: 650,
        shares: 5,
        isBookmarked: false,
        isLiked: true
      }
    ];

    setArticles(mockArticles);
    setLoading(false);
  }, []);

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.author.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesLanguage = selectedLanguage === 'all' || article.language === selectedLanguage;
    
    return matchesSearch && matchesCategory && matchesLanguage;
  });

  const sortedArticles = [...filteredArticles].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      case 'oldest':
        return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
      case 'popular':
        return b.views - a.views;
      case 'reading_time':
        return a.readingTime - b.readingTime;
      default:
        return 0;
    }
  });

  const handleBookmark = (articleId: string) => {
    setArticles(prev => prev.map(article => 
      article.id === articleId 
        ? { ...article, isBookmarked: !article.isBookmarked }
        : article
    ));
    // TODO: Implement bookmark API call
  };

  const handleLike = (articleId: string) => {
    setArticles(prev => prev.map(article => 
      article.id === articleId 
        ? { 
            ...article, 
            isLiked: !article.isLiked,
            likes: article.isLiked ? article.likes - 1 : article.likes + 1
          }
        : article
    ));
    // TODO: Implement like API call
  };

  const handleShare = async (articleId: string, type: string) => {
    try {
      await fetch(`/api/articles/${articleId}/shares`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shareType: type })
      });
      
      // Update share count
      setArticles(prev => prev.map(article => 
        article.id === articleId 
          ? { ...article, shares: (article.shares || 0) + 1 }
          : article
      ));
    } catch (error) {
      console.error('Error sharing article:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading articles...</p>
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
              <h1 className="text-3xl font-bold mb-2">Articles</h1>
              <p className="text-gray-400">Discover amazing content from our community</p>
            </div>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search articles, authors, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 w-full bg-slate-700/50 border-slate-600 text-white placeholder-gray-400"
            />
          </div>
        </div>
      </header>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-slate-800/30 backdrop-blur-xl border-b border-slate-700/50">
          <div className="container mx-auto px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white"
                >
                  {categories.map(category => (
                    <option key={category} value={category.toLowerCase()}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Language Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Language</label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white"
                >
                  {languages.map(lang => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Articles Grid */}
      <main className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <p className="text-gray-400">
            Showing {sortedArticles.length} of {articles.length} articles
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedArticles.map((article) => (
            <article
              key={article.id}
              className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden hover:border-slate-600/50 transition-all duration-300 group"
            >
              {/* Featured Image */}
              {article.featuredImage && (
                <div className="aspect-video bg-slate-700 overflow-hidden">
                  <img
                    src={article.featuredImage}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}

              <div className="p-6">
                {/* Category & Language */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded-full text-xs font-medium">
                    {article.category}
                  </span>
                  <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded-full text-xs">
                    {article.language.toUpperCase()}
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-blue-400 transition-colors">
                  <Link href={`/reader/articles/${article.id}`}>
                    {article.title}
                  </Link>
                </h2>

                {/* Excerpt */}
                <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                  {article.excerpt}
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold">
                      {article.author.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{article.author.name}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(article.publishedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Stats & Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {article.readingTime}m
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {article.views}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(article.id)}
                      className={`p-2 ${article.isLiked ? 'text-red-500' : 'text-gray-400'}`}
                    >
                      <Heart className={`w-4 h-4 ${article.isLiked ? 'fill-current' : ''}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleBookmark(article.id)}
                      className={`p-2 ${article.isBookmarked ? 'text-blue-500' : 'text-gray-400'}`}
                    >
                      <Bookmark className={`w-4 h-4 ${article.isBookmarked ? 'fill-current' : ''}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-2 text-gray-400"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                    <ShareButton
                      articleId={article.id}
                      title={article.title}
                      url={`${window.location.origin}/reader/articles/${article.id}`}
                      excerpt={article.excerpt}
                      onShare={(type) => handleShare(article.id, type)}
                      className="p-2"
                    />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {sortedArticles.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold mb-2">No articles found</h3>
            <p className="text-gray-400 mb-6">
              Try adjusting your search or filter criteria
            </p>
            <Button onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedLanguage('all');
            }}>
              Clear Filters
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
