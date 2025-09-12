// Application Constants

// User Roles & Status
export const USER_ROLES = {
  READER: 'reader',
  WRITER: 'writer', 
  ADMIN: 'admin'
} as const;

export const USER_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  SUSPENDED: 'suspended',
  BANNED: 'banned'
} as const;

export const USER_LEVELS = {
  ROOKIE: 'rookie',
  ACTIVE: 'active', 
  DEDICATED: 'dedicated',
  EXPERT: 'expert',
  MASTER: 'master'
} as const;

// Article Status
export const ARTICLE_STATUS = {
  DRAFT: 'draft',
  REVIEW: 'review',
  REVISION: 'revision', 
  APPROVED: 'approved',
  PUBLISHED: 'published',
  ARCHIVED: 'archived'
} as const;

// Languages
export const LANGUAGES = {
  ENGLISH: 'en',
  SINHALA: 'si'
} as const;

export const LANGUAGE_NAMES = {
  [LANGUAGES.ENGLISH]: 'English',
  [LANGUAGES.SINHALA]: 'සිංහල'
} as const;

// Reading Preferences
export const FONT_FAMILIES = {
  SANS_SERIF: 'sans-serif',
  SERIF: 'serif',
  MONOSPACE: 'monospace'
} as const;

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark'
} as const;

// Points & Levels
export const LEVEL_THRESHOLDS = {
  [USER_LEVELS.ROOKIE]: 0,
  [USER_LEVELS.ACTIVE]: 101,
  [USER_LEVELS.DEDICATED]: 501,
  [USER_LEVELS.EXPERT]: 1501,
  [USER_LEVELS.MASTER]: 5000
} as const;

export const POINTS_SYSTEM = {
  READ_ARTICLE: 10,
  COMPLETE_ARTICLE: 15,
  THOUGHTFUL_COMMENT: 5,
  SHARE_ARTICLE: 3,
  DAILY_LOGIN: 2,
  STREAK_BONUS: {
    MIN: 1,
    MAX: 50
  }
} as const;

// Achievement Types
export const ACHIEVEMENT_TYPES = {
  READING: 'reading',
  STREAK: 'streak',
  SOCIAL: 'social',
  TIME: 'time'
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  ARTICLE: 'article',
  COMMENT: 'comment',
  ACHIEVEMENT: 'achievement',
  SYSTEM: 'system',
  MESSAGE: 'message'
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    VERIFY_OTP: '/api/auth/verify-otp',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    REFRESH_TOKEN: '/api/auth/refresh'
  },
  USERS: {
    PROFILE: '/api/users/profile',
    UPDATE_PROFILE: '/api/users/profile',
    READING_PREFERENCES: '/api/users/reading-preferences',
    ACHIEVEMENTS: '/api/users/achievements',
    STATISTICS: '/api/users/statistics'
  },
  ARTICLES: {
    LIST: '/api/articles',
    DETAIL: '/api/articles',
    CREATE: '/api/articles',
    UPDATE: '/api/articles',
    DELETE: '/api/articles',
    SEARCH: '/api/articles/search',
    TRENDING: '/api/articles/trending',
    RECOMMENDATIONS: '/api/articles/recommendations'
  },
  CATEGORIES: {
    LIST: '/api/categories',
    ARTICLES: '/api/categories'
  },
  COMMENTS: {
    LIST: '/api/comments',
    CREATE: '/api/comments',
    UPDATE: '/api/comments',
    DELETE: '/api/comments',
    LIKE: '/api/comments/like'
  },
  ADMIN: {
    USERS: '/api/admin/users',
    ARTICLES: '/api/admin/articles',
    CATEGORIES: '/api/admin/categories',
    REPORTS: '/api/admin/reports',
    ANALYTICS: '/api/admin/analytics'
  }
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100
} as const;

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp']
} as const;

// Reading Time Categories
export const READING_TIME_CATEGORIES = {
  SHORT: { min: 0, max: 5 },
  MEDIUM: { min: 5, max: 15 },
  LONG: { min: 15, max: Infinity }
} as const;

// Social Media Platforms
export const SOCIAL_PLATFORMS = {
  FACEBOOK: 'facebook',
  TWITTER: 'twitter',
  INSTAGRAM: 'instagram',
  LINKEDIN: 'linkedin',
  YOUTUBE: 'youtube',
  TIKTOK: 'tiktok'
} as const;

// Default Category Colors
export const CATEGORY_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6',
  '#EF4444', '#EC4899', '#06B6D4', '#F97316',
  '#9333EA', '#14B8A6'
] as const;

// OTP Configuration
export const OTP_CONFIG = {
  LENGTH: 6,
  EXPIRY_MINUTES: 15,
  MAX_ATTEMPTS: 3
} as const;

// Session Configuration
export const SESSION_CONFIG = {
  TIMEOUT_MINUTES: 60 * 24, // 24 hours
  REFRESH_THRESHOLD_MINUTES: 60 // Refresh if less than 1 hour remaining
} as const;
