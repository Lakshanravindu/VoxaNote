-- VoxaNote Complete Database Schema - Fixed Version
-- User Management
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  username TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  country TEXT,
  default_language TEXT DEFAULT 'en' CHECK (default_language IN ('en', 'si')),
  role TEXT DEFAULT 'reader' CHECK (role IN ('reader', 'writer', 'admin')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'suspended', 'banned')),
  points INTEGER DEFAULT 0,
  level TEXT DEFAULT 'rookie' CHECK (level IN ('rookie', 'active', 'dedicated', 'expert', 'master')),
  reading_streak INTEGER DEFAULT 0,
  last_active_date DATE,
  total_reading_time INTEGER DEFAULT 0, -- in minutes
  articles_read INTEGER DEFAULT 0,
  social_links JSONB DEFAULT '{}', -- Fix 1: Added social media links
  reading_preferences JSONB DEFAULT '{"fontSize": 16, "fontFamily": "sans-serif", "lineHeight": 1.5, "theme": "light"}', -- Fix 2: Added reading preferences
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Email verification tracking
CREATE TABLE email_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  otp_code TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User approval workflow
CREATE TABLE user_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  notes TEXT,
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Content Management
-- Categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en TEXT NOT NULL,
  name_si TEXT,
  slug TEXT UNIQUE NOT NULL,
  description_en TEXT,
  description_si TEXT,
  color TEXT DEFAULT '#3B82F6',
  icon TEXT,
  parent_id UUID REFERENCES categories(id),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  article_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tags
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en TEXT NOT NULL,
  name_si TEXT,
  slug TEXT UNIQUE NOT NULL,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Articles (with partitioning by created_at)
CREATE TABLE articles (
  id UUID NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'si')),
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id),
  featured_image TEXT,
  featured_image_alt TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'revision', 'approved', 'published', 'archived')),
  reading_time INTEGER,
  word_count INTEGER,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT,
  scheduled_at TIMESTAMP,
  published_at TIMESTAMP,
  featured BOOLEAN DEFAULT false,
  trending BOOLEAN DEFAULT false,
  allow_comments BOOLEAN DEFAULT true,
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (id, created_at),
  UNIQUE (slug, created_at)
) PARTITION BY RANGE (created_at);

-- Define partitions for articles (example for 2023-2026)
CREATE TABLE articles_2023 PARTITION OF articles FOR VALUES FROM ('2023-01-01') TO ('2024-01-01');
CREATE TABLE articles_2024 PARTITION OF articles FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
CREATE TABLE articles_2025 PARTITION OF articles FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
CREATE TABLE articles_2026 PARTITION OF articles FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');

-- Article tags (many-to-many)
CREATE TABLE article_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL,
  article_created_at TIMESTAMP NOT NULL,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(article_id, tag_id),
  FOREIGN KEY (article_id, article_created_at) REFERENCES articles(id, created_at) ON DELETE CASCADE
);

-- Article versions (for draft management)
CREATE TABLE article_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL,
  article_created_at TIMESTAMP NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  version_number INTEGER NOT NULL,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (article_id, article_created_at) REFERENCES articles(id, created_at) ON DELETE CASCADE
);

-- Article translations
CREATE TABLE article_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_article_id UUID NOT NULL,
  original_article_created_at TIMESTAMP NOT NULL,
  translated_article_id UUID NOT NULL,
  translated_article_created_at TIMESTAMP NOT NULL,
  source_language TEXT NOT NULL,
  target_language TEXT NOT NULL,
  translation_type TEXT DEFAULT 'ai' CHECK (translation_type IN ('ai', 'human')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(original_article_id, target_language),
  FOREIGN KEY (original_article_id, original_article_created_at) REFERENCES articles(id, created_at) ON DELETE CASCADE,
  FOREIGN KEY (translated_article_id, translated_article_created_at) REFERENCES articles(id, created_at) ON DELETE CASCADE
);

-- Fix 3: AI Writing Assistant data storage
CREATE TABLE article_ai_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL,
  article_created_at TIMESTAMP NOT NULL,
  readability_score INTEGER,
  grammar_suggestions JSONB,
  seo_suggestions JSONB,
  plagiarism_check_result JSONB,
  title_suggestions JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (article_id, article_created_at) REFERENCES articles(id, created_at) ON DELETE CASCADE
);

-- Fix 4: Offline articles tracking
CREATE TABLE offline_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  article_id UUID NOT NULL,
  article_created_at TIMESTAMP NOT NULL,
  downloaded_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  sync_status TEXT DEFAULT 'downloaded' CHECK (sync_status IN ('downloaded', 'synced', 'expired')),
  UNIQUE(user_id, article_id),
  FOREIGN KEY (article_id, article_created_at) REFERENCES articles(id, created_at) ON DELETE CASCADE
);

-- User interests/preferences
CREATE TABLE user_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  interest_level INTEGER DEFAULT 1 CHECK (interest_level BETWEEN 1 AND 5),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, category_id)
);

-- Social Features & Engagement
-- Comments
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL,
  article_created_at TIMESTAMP NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  is_approved BOOLEAN DEFAULT true,
  is_flagged BOOLEAN DEFAULT false,
  depth INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (article_id, article_created_at) REFERENCES articles(id, created_at) ON DELETE CASCADE
);

-- Article reactions (like, love, wow, etc.)
CREATE TABLE article_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL,
  article_created_at TIMESTAMP NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'love', 'wow', 'laugh', 'angry', 'sad')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(article_id, user_id, reaction_type),
  FOREIGN KEY (article_id, article_created_at) REFERENCES articles(id, created_at) ON DELETE CASCADE
);

-- Comment reactions
CREATE TABLE comment_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'love', 'wow', 'laugh', 'angry', 'sad')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(comment_id, user_id, reaction_type)
);

-- User following system
CREATE TABLE user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK(follower_id != following_id)
);

-- Category following
CREATE TABLE category_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, category_id)
);

-- Bookmarks & Reading Lists
-- Bookmark folders (moved before bookmarks to resolve FK issue)
CREATE TABLE bookmark_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  sort_order INTEGER DEFAULT 0,
  bookmark_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Bookmarks
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  article_id UUID NOT NULL,
  article_created_at TIMESTAMP NOT NULL,
  folder_id UUID REFERENCES bookmark_folders(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, article_id),
  FOREIGN KEY (article_id, article_created_at) REFERENCES articles(id, created_at) ON DELETE CASCADE
);

-- Reading lists
CREATE TABLE reading_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  article_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Reading list articles
CREATE TABLE reading_list_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reading_list_id UUID REFERENCES reading_lists(id) ON DELETE CASCADE,
  article_id UUID NOT NULL,
  article_created_at TIMESTAMP NOT NULL,
  sort_order INTEGER DEFAULT 0,
  added_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(reading_list_id, article_id),
  FOREIGN KEY (article_id, article_created_at) REFERENCES articles(id, created_at) ON DELETE CASCADE
);

-- Analytics & Gamification
-- User reading sessions
CREATE TABLE reading_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  article_id UUID NOT NULL,
  article_created_at TIMESTAMP NOT NULL,
  start_time TIMESTAMP DEFAULT NOW(),
  end_time TIMESTAMP,
  reading_progress DECIMAL(5,2) DEFAULT 0, -- percentage
  time_spent INTEGER DEFAULT 0, -- in seconds
  device_type TEXT,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (article_id, article_created_at) REFERENCES articles(id, created_at) ON DELETE CASCADE
);

-- Achievement definitions
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  badge_color TEXT DEFAULT '#3B82F6',
  achievement_type TEXT CHECK (achievement_type IN ('reading', 'social', 'time', 'streak')),
  requirement_value INTEGER,
  points_reward INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User achievements
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP DEFAULT NOW(),
  progress INTEGER DEFAULT 0,
  UNIQUE(user_id, achievement_id)
);

-- Daily reading streaks
CREATE TABLE reading_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  streak_date DATE NOT NULL,
  articles_read INTEGER DEFAULT 0,
  time_spent INTEGER DEFAULT 0, -- in minutes
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, streak_date)
);

-- User activity log (with partitioning by created_at)
CREATE TABLE user_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('read', 'comment', 'like', 'share', 'bookmark', 'follow')),
  target_id UUID, -- article_id, comment_id, user_id, etc.
  target_type TEXT, -- 'article', 'comment', 'user'
  points_earned INTEGER DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- Define partitions for user_activities (example for 2023-2026)
CREATE TABLE user_activities_2023 PARTITION OF user_activities FOR VALUES FROM ('2023-01-01') TO ('2024-01-01');
CREATE TABLE user_activities_2024 PARTITION OF user_activities FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
CREATE TABLE user_activities_2025 PARTITION OF user_activities FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
CREATE TABLE user_activities_2026 PARTITION OF user_activities FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');

-- Messaging & Notifications
-- Fix 5: Enhanced messages with thread support
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  thread_id UUID, -- For message threading
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file')),
  attachment_url TEXT,
  message_status TEXT DEFAULT 'sent' CHECK (message_status IN ('sent', 'delivered', 'read')),
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('article', 'comment', 'follow', 'achievement', 'admin', 'system')),
  related_id UUID, -- article_id, comment_id, etc.
  related_type TEXT, -- 'article', 'comment', 'user'
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  action_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Notification preferences
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  new_articles BOOLEAN DEFAULT true,
  comment_replies BOOLEAN DEFAULT true,
  achievements BOOLEAN DEFAULT true,
  weekly_digest BOOLEAN DEFAULT true,
  followed_writers BOOLEAN DEFAULT true,
  trending_alerts BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Admin & Content Moderation
-- Admin actions log
CREATE TABLE admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('approve_user', 'reject_user', 'approve_article', 'reject_article', 'ban_user', 'delete_comment')),
  target_id UUID NOT NULL,
  target_type TEXT NOT NULL,
  reason TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Content reports
CREATE TABLE content_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reported_content_id UUID NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('article', 'comment', 'user')),
  report_reason TEXT NOT NULL CHECK (report_reason IN ('spam', 'harassment', 'inappropriate', 'copyright', 'other')),
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Analytics snapshots (for dashboard)
CREATE TABLE analytics_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date DATE NOT NULL,
  total_users INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  total_articles INTEGER DEFAULT 0,
  published_articles INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  total_comments INTEGER DEFAULT 0,
  new_users INTEGER DEFAULT 0,
  articles_published INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(snapshot_date)
);

-- Indexes for Performance
CREATE INDEX idx_articles_status_published ON articles(status, published_at DESC) WHERE status = 'published';
CREATE INDEX idx_articles_author_status ON articles(author_id, status);
CREATE INDEX idx_articles_category_published ON articles(category_id, published_at DESC) WHERE status = 'published';
CREATE INDEX idx_articles_language_published ON articles(language, published_at DESC) WHERE status = 'published';
CREATE INDEX idx_articles_featured ON articles(featured, published_at DESC) WHERE featured = true;
CREATE INDEX idx_articles_trending ON articles(trending, published_at DESC) WHERE trending = true;
CREATE INDEX idx_comments_article_created ON comments(article_id, created_at DESC);
CREATE INDEX idx_user_activities_user_created ON user_activities(user_id, created_at DESC);
CREATE INDEX idx_reading_sessions_user_created ON reading_sessions(user_id, created_at DESC);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_bookmarks_user_created ON bookmarks(user_id, created_at DESC);

-- Full-text search indexes
CREATE INDEX idx_articles_search ON articles USING gin(to_tsvector('english', title || ' ' || content));
CREATE INDEX idx_articles_search_si ON articles USING gin(to_tsvector('simple', title || ' ' || content));

-- Missing indexes (Fix 6)
CREATE INDEX idx_user_interests_user_id ON user_interests(user_id);
CREATE INDEX idx_user_interests_category_id ON user_interests(category_id);
CREATE INDEX idx_user_follows_follower_id ON user_follows(follower_id);
CREATE INDEX idx_user_follows_following_id ON user_follows(following_id);
CREATE INDEX idx_category_follows_user_id ON category_follows(user_id);
CREATE INDEX idx_category_follows_category_id ON category_follows(category_id);
CREATE INDEX idx_article_tags_article_id ON article_tags(article_id);
CREATE INDEX idx_article_tags_tag_id ON article_tags(tag_id);
CREATE INDEX idx_bookmarks_folder_id ON bookmarks(folder_id);
CREATE INDEX idx_reading_list_articles_reading_list_id ON reading_list_articles(reading_list_id);

-- New indexes for added features
CREATE INDEX idx_profiles_social_links ON profiles USING gin(social_links);
CREATE INDEX idx_profiles_reading_preferences ON profiles USING gin(reading_preferences);
CREATE INDEX idx_messages_thread_id ON messages(thread_id);
CREATE INDEX idx_messages_sender_recipient ON messages(sender_id, recipient_id, created_at DESC);
CREATE INDEX idx_offline_articles_user_id ON offline_articles(user_id);
CREATE INDEX idx_offline_articles_sync_status ON offline_articles(sync_status);

-- Triggers and Functions for Counters
-- Function to update category article_count
CREATE OR REPLACE FUNCTION update_category_article_count() RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE categories SET article_count = article_count + 1 WHERE id = NEW.category_id;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE categories SET article_count = article_count - 1 WHERE id = OLD.category_id;
  ELSIF (TG_OP = 'UPDATE') THEN
    IF (OLD.category_id != NEW.category_id) THEN
      UPDATE categories SET article_count = article_count - 1 WHERE id = OLD.category_id;
      UPDATE categories SET article_count = article_count + 1 WHERE id = NEW.category_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trig_update_category_article_count
AFTER INSERT OR UPDATE OR DELETE ON articles
FOR EACH ROW EXECUTE PROCEDURE update_category_article_count();

-- Function to update tag usage_count
CREATE OR REPLACE FUNCTION update_tag_usage_count() RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE tags SET usage_count = usage_count + 1 WHERE id = NEW.tag_id;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE tags SET usage_count = usage_count - 1 WHERE id = OLD.tag_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trig_update_tag_usage_count
AFTER INSERT OR DELETE ON article_tags
FOR EACH ROW EXECUTE PROCEDURE update_tag_usage_count();

-- Function to update bookmark_folder bookmark_count
CREATE OR REPLACE FUNCTION update_bookmark_folder_count() RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE bookmark_folders SET bookmark_count = bookmark_count + 1 WHERE id = NEW.folder_id;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE bookmark_folders SET bookmark_count = bookmark_count - 1 WHERE id = OLD.folder_id;
  ELSIF (TG_OP = 'UPDATE') THEN
    IF (OLD.folder_id != NEW.folder_id) THEN
      UPDATE bookmark_folders SET bookmark_count = bookmark_count - 1 WHERE id = OLD.folder_id;
      UPDATE bookmark_folders SET bookmark_count = bookmark_count + 1 WHERE id = NEW.folder_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trig_update_bookmark_folder_count
AFTER INSERT OR UPDATE OR DELETE ON bookmarks
FOR EACH ROW EXECUTE PROCEDURE update_bookmark_folder_count();

-- Function to update article comments_count
CREATE OR REPLACE FUNCTION update_article_comments_count() RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE articles SET comments_count = comments_count + 1 WHERE id = NEW.article_id AND created_at = NEW.article_created_at;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE articles SET comments_count = comments_count - 1 WHERE id = OLD.article_id AND created_at = OLD.article_created_at;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trig_update_article_comments_count
AFTER INSERT OR DELETE ON comments
FOR EACH ROW EXECUTE PROCEDURE update_article_comments_count();

-- Function to update comment replies_count
CREATE OR REPLACE FUNCTION update_comment_replies_count() RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT' AND NEW.parent_id IS NOT NULL) THEN
    UPDATE comments SET replies_count = replies_count + 1 WHERE id = NEW.parent_id;
  ELSIF (TG_OP = 'DELETE' AND OLD.parent_id IS NOT NULL) THEN
    UPDATE comments SET replies_count = replies_count - 1 WHERE id = OLD.parent_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trig_update_comment_replies_count
AFTER INSERT OR DELETE ON comments
FOR EACH ROW
EXECUTE PROCEDURE update_comment_replies_count();

-- Function to update reading list article count
CREATE OR REPLACE FUNCTION update_reading_list_article_count() RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE reading_lists SET article_count = article_count + 1 WHERE id = NEW.reading_list_id;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE reading_lists SET article_count = article_count - 1 WHERE id = OLD.reading_list_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trig_update_reading_list_article_count
AFTER INSERT OR DELETE ON reading_list_articles
FOR EACH ROW EXECUTE PROCEDURE update_reading_list_article_count();

-- Function to update message thread_id automatically
CREATE OR REPLACE FUNCTION update_message_thread() RETURNS TRIGGER AS $$
BEGIN
  -- If no thread_id provided, create one based on participants
  IF NEW.thread_id IS NULL THEN
    -- Create a consistent thread_id by sorting participant IDs
    NEW.thread_id = encode(sha256(
      CASE 
        WHEN NEW.sender_id < NEW.recipient_id 
        THEN NEW.sender_id::text || NEW.recipient_id::text
        ELSE NEW.recipient_id::text || NEW.sender_id::text
      END::bytea
    ), 'hex')::uuid;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trig_update_message_thread
BEFORE INSERT ON messages
FOR EACH ROW EXECUTE PROCEDURE update_message_thread();

-- Function to auto-update user level based on points
CREATE OR REPLACE FUNCTION update_user_level() RETURNS TRIGGER AS $$
BEGIN
  NEW.level = CASE 
    WHEN NEW.points >= 5000 THEN 'master'
    WHEN NEW.points >= 1501 THEN 'expert'
    WHEN NEW.points >= 501 THEN 'dedicated'
    WHEN NEW.points >= 101 THEN 'active'
    ELSE 'rookie'
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trig_update_user_level
BEFORE UPDATE OF points ON profiles
FOR EACH ROW EXECUTE PROCEDURE update_user_level();

-- Function to clean up expired offline articles
CREATE OR REPLACE FUNCTION cleanup_expired_offline_articles() RETURNS void AS $$
BEGIN
  UPDATE offline_articles 
  SET sync_status = 'expired' 
  WHERE expires_at < NOW() AND sync_status = 'downloaded';
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_ai_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE offline_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmark_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_list_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_snapshots ENABLE ROW LEVEL SECURITY;

-- Row-Level Security Policies
-- PROFILES table policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Anyone can view approved user profiles" ON profiles
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- EMAIL_VERIFICATIONS policies (Fix 7: Security improvement)
CREATE POLICY "Users can create own verification" ON email_verifications
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view own verifications" ON email_verifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can delete own verifications" ON email_verifications
  FOR DELETE USING (user_id = auth.uid());

-- USER_APPROVALS policies  
CREATE POLICY "Users can create approval request" ON user_approvals
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view own approval" ON user_approvals
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all approvals" ON user_approvals
  FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- USER_INTERESTS policies
CREATE POLICY "Users can manage own interests" ON user_interests
  FOR ALL USING (user_id = auth.uid());

-- CATEGORIES policies
CREATE POLICY "Anyone can view categories" ON categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage categories" ON categories
  FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- TAGS policies
CREATE POLICY "Anyone can view tags" ON tags
  FOR SELECT USING (true);

CREATE POLICY "Writers can create tags" ON tags
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('writer', 'admin')
  ));

-- ARTICLES policies
CREATE POLICY "Published articles are public" ON articles
  FOR SELECT USING (status = 'published');

CREATE POLICY "Authors can view own articles" ON articles
  FOR SELECT USING (author_id = auth.uid());

CREATE POLICY "Admins can view all articles" ON articles
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Authors can create articles" ON articles
  FOR INSERT WITH CHECK (author_id = auth.uid());

CREATE POLICY "Authors can update own articles" ON articles
  FOR UPDATE USING (author_id = auth.uid());

CREATE POLICY "Admins can update any article" ON articles
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Authors can delete own drafts" ON articles
  FOR DELETE USING (author_id = auth.uid() AND status = 'draft');

-- ARTICLE_AI_ANALYSIS policies
CREATE POLICY "Authors can view own article analysis" ON article_ai_analysis
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM articles WHERE id = article_id AND created_at = article_created_at AND author_id = auth.uid()
  ));

CREATE POLICY "System can create analysis" ON article_ai_analysis
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM articles WHERE id = article_id AND created_at = article_created_at AND author_id = auth.uid()
  ));

-- OFFLINE_ARTICLES policies
CREATE POLICY "Users can manage own offline articles" ON offline_articles
  FOR ALL USING (user_id = auth.uid());

-- ARTICLE_TAGS policies
CREATE POLICY "Anyone can view article tags" ON article_tags
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM articles WHERE id = article_id AND created_at = article_created_at AND status = 'published'
  ));

CREATE POLICY "Authors can manage own article tags" ON article_tags
  FOR ALL USING (EXISTS (
    SELECT 1 FROM articles WHERE id = article_id AND created_at = article_created_at AND author_id = auth.uid()
  ));

-- ARTICLE_VERSIONS policies
CREATE POLICY "Authors can manage article versions" ON article_versions
  FOR ALL USING (EXISTS (
    SELECT 1 FROM articles WHERE id = article_id AND created_at = article_created_at AND author_id = auth.uid()
  ));

-- ARTICLE_TRANSLATIONS policies
CREATE POLICY "View published translations" ON article_translations
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM articles WHERE id = original_article_id AND created_at = original_article_created_at AND status = 'published'
  ));

-- COMMENTS policies
CREATE POLICY "View comments on published articles" ON comments
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM articles WHERE id = article_id AND created_at = article_created_at AND status = 'published'
  ));

CREATE POLICY "Authenticated users can comment" ON comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments" ON comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON comments
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can moderate comments" ON comments
  FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- ARTICLE_REACTIONS policies
CREATE POLICY "Anyone can view reactions" ON article_reactions
  FOR SELECT USING (true);

CREATE POLICY "Users can manage own reactions" ON article_reactions
  FOR ALL USING (user_id = auth.uid());

-- COMMENT_REACTIONS policies
CREATE POLICY "Anyone can view comment reactions" ON comment_reactions
  FOR SELECT USING (true);

CREATE POLICY "Users can manage own comment reactions" ON comment_reactions
  FOR ALL USING (user_id = auth.uid());

-- USER_FOLLOWS policies
CREATE POLICY "Anyone can view follows" ON user_follows
  FOR SELECT USING (true);

CREATE POLICY "Users can manage own follows" ON user_follows
  FOR ALL USING (follower_id = auth.uid());

-- CATEGORY_FOLLOWS policies
CREATE POLICY "Users can manage category follows" ON category_follows
  FOR ALL USING (user_id = auth.uid());

-- BOOKMARKS policies
CREATE POLICY "Users manage own bookmarks" ON bookmarks
  FOR ALL USING (user_id = auth.uid());

-- BOOKMARK_FOLDERS policies
CREATE POLICY "Users manage own folders" ON bookmark_folders
  FOR ALL USING (user_id = auth.uid());

-- READING_LISTS policies
CREATE POLICY "Users manage own lists" ON reading_lists
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Public lists viewable" ON reading_lists
  FOR SELECT USING (is_public = true);

-- READING_LIST_ARTICLES policies
CREATE POLICY "Manage own list articles" ON reading_list_articles
  FOR ALL USING (EXISTS (
    SELECT 1 FROM reading_lists WHERE id = reading_list_id AND user_id = auth.uid()
  ) AND EXISTS (
    SELECT 1 FROM articles WHERE id = article_id AND created_at = article_created_at
  ));

-- READING_SESSIONS policies
CREATE POLICY "Users manage own sessions" ON reading_sessions
  FOR ALL USING (user_id = auth.uid());

-- ACHIEVEMENTS policies
CREATE POLICY "Anyone can view achievements" ON achievements
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage achievements" ON achievements
  FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- USER_ACHIEVEMENTS policies
CREATE POLICY "Users view own achievements" ON user_achievements
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can grant achievements" ON user_achievements
  FOR INSERT WITH CHECK (true);

-- READING_STREAKS policies
CREATE POLICY "Users manage own streaks" ON reading_streaks
  FOR ALL USING (user_id = auth.uid());

-- USER_ACTIVITIES policies (Fix 8: System insert policy)
CREATE POLICY "Users view own activities" ON user_activities
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can log user activities" ON user_activities
  FOR INSERT WITH CHECK (user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- MESSAGES policies (Fix 9: Missing RLS policies)
CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update own sent messages" ON messages
  FOR UPDATE USING (sender_id = auth.uid());

CREATE POLICY "Users can delete own sent messages" ON messages
  FOR DELETE USING (sender_id = auth.uid());

-- NOTIFICATIONS policies (Fix 10: Missing RLS policies)
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own notifications" ON notifications
  FOR DELETE USING (user_id = auth.uid());

-- NOTIFICATION_PREFERENCES policies (Fix 11: Missing RLS policies)
CREATE POLICY "Users can manage own notification preferences" ON notification_preferences
  FOR ALL USING (user_id = auth.uid());

-- ADMIN_ACTIONS policies
CREATE POLICY "Admins can create actions" ON admin_actions
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admins can view all actions" ON admin_actions
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- CONTENT_REPORTS policies
CREATE POLICY "Users can create reports" ON content_reports
  FOR INSERT WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "Users can view own reports" ON content_reports
  FOR SELECT USING (reporter_id = auth.uid());

CREATE POLICY "Admins can manage reports" ON content_reports
  FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- ANALYTICS_SNAPSHOTS policies (Fix 12: Admin-only writes)
CREATE POLICY "Anyone can view analytics" ON analytics_snapshots
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage analytics" ON analytics_snapshots
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admins can update analytics" ON analytics_snapshots
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Insert default categories (English only)
INSERT INTO categories (name_en, slug, description_en, color, icon) VALUES
('Technology', 'technology', 'Latest in tech and innovation', '#3B82F6', 'cpu'),
('Health & Wellness', 'health-wellness', 'Health tips and wellness advice', '#10B981', 'heart'),
('Education', 'education', 'Learning and educational content', '#F59E0B', 'book-open'),
('Science', 'science', 'Scientific discoveries and research', '#8B5CF6', 'microscope'),
('Business', 'business', 'Business news and entrepreneurship', '#EF4444', 'briefcase'),
('Lifestyle', 'lifestyle', 'Lifestyle tips and trends', '#EC4899', 'coffee'),
('Sports', 'sports', 'Sports news and updates', '#06B6D4', 'trophy'),
('Entertainment', 'entertainment', 'Movies, music and entertainment', '#F97316', 'film'),
('Politics', 'politics', 'Political news and analysis', '#9333EA', 'flag'),
('Travel', 'travel', 'Travel guides and destinations', '#14B8A6', 'map-pin'),
('Food', 'food', 'Recipes and culinary adventures', '#F97316', 'chef-hat'),
('Art & Culture', 'art-culture', 'Arts, culture and creative expression', '#EC4899', 'palette');

-- Insert default achievements
INSERT INTO achievements (name, description, icon, achievement_type, requirement_value, points_reward) VALUES
('First Steps', 'Read your first article', 'bookmark', 'reading', 1, 10),
('Getting Started', 'Read 10 articles', 'book-open', 'reading', 10, 50),
('Bookworm', 'Read 50 articles', 'books', 'reading', 50, 200),
('Knowledge Seeker', 'Read 100 articles', 'graduation-cap', 'reading', 100, 500),
('Scholar', 'Read 500 articles', 'award', 'reading', 500, 2000),
('Master Reader', 'Read 1000 articles', 'crown', 'reading', 1000, 5000),
('Week Warrior', 'Read for 7 consecutive days', 'calendar', 'streak', 7, 100),
('Month Master', 'Read for 30 consecutive days', 'calendar-check', 'streak', 30, 1000),
('Social Butterfly', 'Make 10 comments', 'message-circle', 'social', 10, 50),
('Community Helper', 'Make 100 comments', 'users', 'social', 100, 500),
('Time Master', 'Spend 10 hours reading', 'clock', 'time', 600, 300),
('Dedicated Reader', 'Spend 100 hours reading', 'clock', 'time', 6000, 2000);

-- Create indexes on partitioned tables for better performance
CREATE INDEX idx_articles_2023_status_published ON articles_2023(status, published_at DESC) WHERE status = 'published';
CREATE INDEX idx_articles_2024_status_published ON articles_2024(status, published_at DESC) WHERE status = 'published';
CREATE INDEX idx_articles_2025_status_published ON articles_2025(status, published_at DESC) WHERE status = 'published';
CREATE INDEX idx_articles_2026_status_published ON articles_2026(status, published_at DESC) WHERE status = 'published';

CREATE INDEX idx_user_activities_2023_user_created ON user_activities_2023(user_id, created_at DESC);
CREATE INDEX idx_user_activities_2024_user_created ON user_activities_2024(user_id, created_at DESC);
CREATE INDEX idx_user_activities_2025_user_created ON user_activities_2025(user_id, created_at DESC);
CREATE INDEX idx_user_activities_2026_user_created ON user_activities_2026(user_id, created_at DESC);