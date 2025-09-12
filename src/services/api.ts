import { supabase } from '@/lib/supabase';
import { API_ENDPOINTS } from '@/constants';
import { 
  User, 
  Article, 
  Category, 
  Comment,
  ApiResponse, 
  PaginatedResponse,
  SearchFilters,
  RegisterForm,
  LoginForm
} from '@/types';

// Base API client
class ApiClient {
  private async request<T>(
    url: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers as Record<string, string>
      };

      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      const response = await fetch(url, {
        ...options,
        headers
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async get<T>(url: string): Promise<ApiResponse<T>> {
    return this.request<T>(url, { method: 'GET' });
  }

  async post<T>(url: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async put<T>(url: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    return this.request<T>(url, { method: 'DELETE' });
  }
}

const apiClient = new ApiClient();

// Auth API
export const authApi = {
  register: (data: RegisterForm) => 
    apiClient.post<{ user: User }>(API_ENDPOINTS.AUTH.REGISTER, data),

  login: (data: LoginForm) => 
    apiClient.post<{ user: User; session: any }>(API_ENDPOINTS.AUTH.LOGIN, data),

  logout: () => 
    apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, {}),

  verifyOTP: (otp: string, email: string) => 
    apiClient.post(API_ENDPOINTS.AUTH.VERIFY_OTP, { otp, email }),

  forgotPassword: (email: string) => 
    apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email }),

  resetPassword: (token: string, password: string) => 
    apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { token, password })
};

// User API
export const userApi = {
  getProfile: () => 
    apiClient.get<User>(API_ENDPOINTS.USERS.PROFILE),

  updateProfile: (data: Partial<User>) => 
    apiClient.put<User>(API_ENDPOINTS.USERS.UPDATE_PROFILE, data),

  getReadingPreferences: () => 
    apiClient.get(API_ENDPOINTS.USERS.READING_PREFERENCES),

  updateReadingPreferences: (preferences: any) => 
    apiClient.put(API_ENDPOINTS.USERS.READING_PREFERENCES, preferences),

  getAchievements: () => 
    apiClient.get(API_ENDPOINTS.USERS.ACHIEVEMENTS),

  getStatistics: () => 
    apiClient.get(API_ENDPOINTS.USERS.STATISTICS)
};

// Article API
export const articleApi = {
  getArticles: (params: {
    page?: number;
    limit?: number;
    filters?: SearchFilters;
  } = {}) => {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.filters?.query) searchParams.set('search', params.filters.query);
    if (params.filters?.category) searchParams.set('category', params.filters.category);
    if (params.filters?.language) searchParams.set('language', params.filters.language);
    if (params.filters?.sortBy) searchParams.set('sortBy', params.filters.sortBy);
    
    const url = `${API_ENDPOINTS.ARTICLES.LIST}?${searchParams.toString()}`;
    return apiClient.get<PaginatedResponse<Article>>(url);
  },

  getArticle: (id: string) => 
    apiClient.get<Article>(`${API_ENDPOINTS.ARTICLES.DETAIL}/${id}`),

  createArticle: (data: Partial<Article>) => 
    apiClient.post<Article>(API_ENDPOINTS.ARTICLES.CREATE, data),

  updateArticle: (id: string, data: Partial<Article>) => 
    apiClient.put<Article>(`${API_ENDPOINTS.ARTICLES.UPDATE}/${id}`, data),

  deleteArticle: (id: string) => 
    apiClient.delete(`${API_ENDPOINTS.ARTICLES.DELETE}/${id}`),

  searchArticles: (query: string, filters?: SearchFilters) => {
    const searchParams = new URLSearchParams({ q: query });
    
    if (filters?.category) searchParams.set('category', filters.category);
    if (filters?.language) searchParams.set('language', filters.language);
    
    const url = `${API_ENDPOINTS.ARTICLES.SEARCH}?${searchParams.toString()}`;
    return apiClient.get<PaginatedResponse<Article>>(url);
  },

  getTrendingArticles: () => 
    apiClient.get<Article[]>(API_ENDPOINTS.ARTICLES.TRENDING),

  getRecommendations: () => 
    apiClient.get<Article[]>(API_ENDPOINTS.ARTICLES.RECOMMENDATIONS)
};

// Category API
export const categoryApi = {
  getCategories: () => 
    apiClient.get<Category[]>(API_ENDPOINTS.CATEGORIES.LIST),

  getCategoryArticles: (slug: string, params: {
    page?: number;
    limit?: number;
  } = {}) => {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    
    const url = `${API_ENDPOINTS.CATEGORIES.ARTICLES}/${slug}?${searchParams.toString()}`;
    return apiClient.get<PaginatedResponse<Article>>(url);
  }
};

// Comment API
export const commentApi = {
  getComments: (articleId: string) => 
    apiClient.get<Comment[]>(`${API_ENDPOINTS.COMMENTS.LIST}/${articleId}`),

  createComment: (data: {
    articleId: string;
    content: string;
    parentId?: string;
  }) => 
    apiClient.post<Comment>(API_ENDPOINTS.COMMENTS.CREATE, data),

  updateComment: (id: string, content: string) => 
    apiClient.put<Comment>(`${API_ENDPOINTS.COMMENTS.UPDATE}/${id}`, { content }),

  deleteComment: (id: string) => 
    apiClient.delete(`${API_ENDPOINTS.COMMENTS.DELETE}/${id}`),

  likeComment: (id: string) => 
    apiClient.post(`${API_ENDPOINTS.COMMENTS.LIKE}/${id}`, {})
};

// Admin API
export const adminApi = {
  getUsers: (params: {
    page?: number;
    limit?: number;
    status?: string;
  } = {}) => {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.status) searchParams.set('status', params.status);
    
    const url = `${API_ENDPOINTS.ADMIN.USERS}?${searchParams.toString()}`;
    return apiClient.get<PaginatedResponse<User>>(url);
  },

  approveUser: (userId: string) => 
    apiClient.post(`${API_ENDPOINTS.ADMIN.USERS}/${userId}/approve`, {}),

  rejectUser: (userId: string, reason: string) => 
    apiClient.post(`${API_ENDPOINTS.ADMIN.USERS}/${userId}/reject`, { reason }),

  getArticles: (params: {
    page?: number;
    limit?: number;
    status?: string;
  } = {}) => {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.status) searchParams.set('status', params.status);
    
    const url = `${API_ENDPOINTS.ADMIN.ARTICLES}?${searchParams.toString()}`;
    return apiClient.get<PaginatedResponse<Article>>(url);
  },

  approveArticle: (articleId: string) => 
    apiClient.post(`${API_ENDPOINTS.ADMIN.ARTICLES}/${articleId}/approve`, {}),

  rejectArticle: (articleId: string, reason: string) => 
    apiClient.post(`${API_ENDPOINTS.ADMIN.ARTICLES}/${articleId}/reject`, { reason }),

  getAnalytics: () => 
    apiClient.get(API_ENDPOINTS.ADMIN.ANALYTICS)
};
