import { create } from 'zustand';
import { Article, Category, SearchFilters, PaginatedResponse } from '@/types';

interface ArticleState {
  // Articles data
  articles: Article[];
  currentArticle: Article | null;
  categories: Category[];
  
  // UI state
  loading: boolean;
  error: string | null;
  
  // Pagination & filtering
  currentPage: number;
  totalPages: number;
  totalCount: number;
  filters: SearchFilters;
  
  // Reading state
  bookmarks: string[]; // article IDs
  readingHistory: string[]; // article IDs
  currentReadingPosition: Record<string, number>; // articleId -> position
}

interface ArticleActions {
  // Data actions
  setArticles: (response: PaginatedResponse<Article>) => void;
  setCurrentArticle: (article: Article | null) => void;
  setCategories: (categories: Category[]) => void;
  addArticle: (article: Article) => void;
  updateArticle: (id: string, updates: Partial<Article>) => void;
  removeArticle: (id: string) => void;
  
  // UI actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Filter & pagination actions
  setFilters: (filters: Partial<SearchFilters>) => void;
  resetFilters: () => void;
  setPage: (page: number) => void;
  
  // Reading actions
  addBookmark: (articleId: string) => void;
  removeBookmark: (articleId: string) => void;
  toggleBookmark: (articleId: string) => void;
  addToHistory: (articleId: string) => void;
  setReadingPosition: (articleId: string, position: number) => void;
  
  // Utility actions
  reset: () => void;
}

export type ArticleStore = ArticleState & ArticleActions;

const initialFilters: SearchFilters = {
  query: '',
  category: '',
  language: undefined,
  sortBy: 'latest'
};

export const useArticleStore = create<ArticleStore>()((set, get) => ({
  // Initial state
  articles: [],
  currentArticle: null,
  categories: [],
  loading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  totalCount: 0,
  filters: initialFilters,
  bookmarks: [],
  readingHistory: [],
  currentReadingPosition: {},

  // Data actions
  setArticles: (response) =>
    set({
      articles: response.data,
      currentPage: response.pagination.page,
      totalPages: response.pagination.totalPages,
      totalCount: response.pagination.total,
      loading: false,
      error: null
    }),

  setCurrentArticle: (article) =>
    set({ currentArticle: article }),

  setCategories: (categories) =>
    set({ categories }),

  addArticle: (article) =>
    set((state) => ({
      articles: [article, ...state.articles],
      totalCount: state.totalCount + 1
    })),

  updateArticle: (id, updates) =>
    set((state) => ({
      articles: state.articles.map(article =>
        article.id === id ? { ...article, ...updates } : article
      ),
      currentArticle: state.currentArticle?.id === id
        ? { ...state.currentArticle, ...updates }
        : state.currentArticle
    })),

  removeArticle: (id) =>
    set((state) => ({
      articles: state.articles.filter(article => article.id !== id),
      currentArticle: state.currentArticle?.id === id ? null : state.currentArticle,
      totalCount: Math.max(0, state.totalCount - 1)
    })),

  // UI actions
  setLoading: (loading) =>
    set({ loading }),

  setError: (error) =>
    set({ error, loading: false }),

  clearError: () =>
    set({ error: null }),

  // Filter & pagination actions
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      currentPage: 1 // Reset to first page when filters change
    })),

  resetFilters: () =>
    set({
      filters: initialFilters,
      currentPage: 1
    }),

  setPage: (page) =>
    set({ currentPage: page }),

  // Reading actions
  addBookmark: (articleId) =>
    set((state) => ({
      bookmarks: state.bookmarks.includes(articleId)
        ? state.bookmarks
        : [...state.bookmarks, articleId]
    })),

  removeBookmark: (articleId) =>
    set((state) => ({
      bookmarks: state.bookmarks.filter(id => id !== articleId)
    })),

  toggleBookmark: (articleId) => {
    const { bookmarks, addBookmark, removeBookmark } = get();
    if (bookmarks.includes(articleId)) {
      removeBookmark(articleId);
    } else {
      addBookmark(articleId);
    }
  },

  addToHistory: (articleId) =>
    set((state) => ({
      readingHistory: [
        articleId,
        ...state.readingHistory.filter(id => id !== articleId)
      ].slice(0, 100) // Keep only last 100 articles
    })),

  setReadingPosition: (articleId, position) =>
    set((state) => ({
      currentReadingPosition: {
        ...state.currentReadingPosition,
        [articleId]: position
      }
    })),

  // Utility actions
  reset: () =>
    set({
      articles: [],
      currentArticle: null,
      loading: false,
      error: null,
      currentPage: 1,
      totalPages: 1,
      totalCount: 0,
      filters: initialFilters
    })
}));
