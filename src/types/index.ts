// Global Types for VertoNote
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username?: string;
  avatarUrl?: string;
  bio?: string;
  country?: string;
  defaultLanguage: 'en' | 'si';
  role: 'reader' | 'writer' | 'admin';
  status: 'pending' | 'approved' | 'suspended' | 'banned';
  points: number;
  level: 'rookie' | 'active' | 'dedicated' | 'expert' | 'master';
  readingStreak: number;
  lastActiveDate?: string;
  totalReadingTime: number;
  articlesRead: number;
  socialLinks?: Record<string, string>;
  readingPreferences: ReadingPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface ReadingPreferences {
  fontSize: number;
  fontFamily: 'sans-serif' | 'serif' | 'monospace';
  lineHeight: number;
  theme: 'light' | 'dark';
  characterSpacing?: number;
  pageWidth?: number;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  language: 'en' | 'si';
  authorId: string;
  author?: User;
  categoryId: string;
  category?: Category;
  featuredImage?: string;
  featuredImageAlt?: string;
  status: 'draft' | 'review' | 'revision' | 'approved' | 'published' | 'archived';
  readingTime?: number;
  wordCount?: number;
  views: number;
  likes: number;
  shares: number;
  commentsCount: number;
  seoTitle?: string;
  seoDescription?: string;
  scheduledAt?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  tags?: Tag[];
}

export interface Category {
  id: string;
  nameEn: string;
  nameSi?: string;
  slug: string;
  descriptionEn?: string;
  descriptionSi?: string;
  color: string;
  icon?: string;
  parentId?: string;
  sortOrder: number;
  isActive: boolean;
  articleCount: number;
  createdAt: string;
}

export interface Tag {
  id: string;
  nameEn: string;
  nameSi?: string;
  slug: string;
  usageCount: number;
  createdAt: string;
}

export interface Comment {
  id: string;
  articleId: string;
  authorId: string;
  author?: User;
  content: string;
  parentId?: string;
  replies?: Comment[];
  likes: number;
  isEdited: boolean;
  isModerated: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  achievementType: 'reading' | 'streak' | 'social' | 'time';
  requirementValue: number;
  pointsReward: number;
  isActive: boolean;
  createdAt: string;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  achievement?: Achievement;
  unlockedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'article' | 'comment' | 'achievement' | 'system' | 'message';
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  sender?: User;
  recipientId: string;
  recipient?: User;
  subject?: string;
  content: string;
  isRead: boolean;
  attachments?: string[];
  createdAt: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form Types
export interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  profilePhoto?: File;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface OTPVerificationForm {
  otp: string;
}

// Search & Filter Types
export interface SearchFilters {
  query?: string;
  category?: string;
  author?: string;
  language?: 'en' | 'si';
  dateFrom?: string;
  dateTo?: string;
  readingTime?: 'short' | 'medium' | 'long';
  sortBy?: 'latest' | 'popular' | 'trending';
}

export interface ArticleFilters extends SearchFilters {
  status?: Article['status'];
  tags?: string[];
}
