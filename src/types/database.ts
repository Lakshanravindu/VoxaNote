// Supabase Database Types (Generated from Schema)
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          username: string | null;
          avatar_url: string | null;
          bio: string | null;
          country: string | null;
          default_language: 'en' | 'si';
          role: 'reader' | 'writer' | 'admin';
          status: 'pending' | 'approved' | 'suspended' | 'banned';
          points: number;
          level: 'rookie' | 'active' | 'dedicated' | 'expert' | 'master';
          reading_streak: number;
          last_active_date: string | null;
          total_reading_time: number;
          articles_read: number;
          social_links: Record<string, any> | null;
          reading_preferences: Record<string, any>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          username?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          country?: string | null;
          default_language?: 'en' | 'si';
          role?: 'reader' | 'writer' | 'admin';
          status?: 'pending' | 'approved' | 'suspended' | 'banned';
          points?: number;
          level?: 'rookie' | 'active' | 'dedicated' | 'expert' | 'master';
          reading_streak?: number;
          last_active_date?: string | null;
          total_reading_time?: number;
          articles_read?: number;
          social_links?: Record<string, any> | null;
          reading_preferences?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string;
          last_name?: string;
          username?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          country?: string | null;
          default_language?: 'en' | 'si';
          role?: 'reader' | 'writer' | 'admin';
          status?: 'pending' | 'approved' | 'suspended' | 'banned';
          points?: number;
          level?: 'rookie' | 'active' | 'dedicated' | 'expert' | 'master';
          reading_streak?: number;
          last_active_date?: string | null;
          total_reading_time?: number;
          articles_read?: number;
          social_links?: Record<string, any> | null;
          reading_preferences?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name_en: string;
          name_si: string | null;
          slug: string;
          description_en: string | null;
          description_si: string | null;
          color: string;
          icon: string | null;
          parent_id: string | null;
          sort_order: number;
          is_active: boolean;
          article_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name_en: string;
          name_si?: string | null;
          slug: string;
          description_en?: string | null;
          description_si?: string | null;
          color?: string;
          icon?: string | null;
          parent_id?: string | null;
          sort_order?: number;
          is_active?: boolean;
          article_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name_en?: string;
          name_si?: string | null;
          slug?: string;
          description_en?: string | null;
          description_si?: string | null;
          color?: string;
          icon?: string | null;
          parent_id?: string | null;
          sort_order?: number;
          is_active?: boolean;
          article_count?: number;
          created_at?: string;
        };
      };
      articles: {
        Row: {
          id: string;
          title: string;
          slug: string;
          content: string;
          excerpt: string | null;
          language: 'en' | 'si';
          author_id: string;
          category_id: string | null;
          featured_image: string | null;
          featured_image_alt: string | null;
          status: 'draft' | 'review' | 'revision' | 'approved' | 'published' | 'archived';
          reading_time: number | null;
          word_count: number | null;
          views: number;
          likes: number;
          shares: number;
          comments_count: number;
          seo_title: string | null;
          seo_description: string | null;
          scheduled_at: string | null;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          content: string;
          excerpt?: string | null;
          language?: 'en' | 'si';
          author_id: string;
          category_id?: string | null;
          featured_image?: string | null;
          featured_image_alt?: string | null;
          status?: 'draft' | 'review' | 'revision' | 'approved' | 'published' | 'archived';
          reading_time?: number | null;
          word_count?: number | null;
          views?: number;
          likes?: number;
          shares?: number;
          comments_count?: number;
          seo_title?: string | null;
          seo_description?: string | null;
          scheduled_at?: string | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          content?: string;
          excerpt?: string | null;
          language?: 'en' | 'si';
          author_id?: string;
          category_id?: string | null;
          featured_image?: string | null;
          featured_image_alt?: string | null;
          status?: 'draft' | 'review' | 'revision' | 'approved' | 'published' | 'archived';
          reading_time?: number | null;
          word_count?: number | null;
          views?: number;
          likes?: number;
          shares?: number;
          comments_count?: number;
          seo_title?: string | null;
          seo_description?: string | null;
          scheduled_at?: string | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      // Add more table types as needed...
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
