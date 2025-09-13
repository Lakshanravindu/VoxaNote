// Environment Variables Configuration

// Supabase Configuration
// Support both NEXT_PUBLIC_* (browser) and server-only names as fallbacks
export const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '') as string;
export const SUPABASE_ANON_KEY = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '') as string;
export const SUPABASE_SERVICE_ROLE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || '') as string;

// Email Service
export const RESEND_API_KEY = process.env.RESEND_API_KEY!;

// Application Configuration
export const NEXTAUTH_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';
export const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET!;

// Email Configuration - Use verified domain
export const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@lakshanweerasingha.com';
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'lakatech99@gmail.com';

// Application Settings
export const APP_NAME = process.env.APP_NAME || 'VertoNote';
export const APP_URL = process.env.APP_URL || 'http://localhost:3000';
export const APP_DOMAIN = process.env.APP_DOMAIN || 'vertonote.com';

// OTP Configuration
export const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES || '15');
export const OTP_MAX_ATTEMPTS = parseInt(process.env.OTP_MAX_ATTEMPTS || '3');

// File Upload Configuration
export const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '5242880'); // 5MB
export const ALLOWED_FILE_TYPES = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/webp').split(',');

// Rate Limiting
export const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX || '100');
export const RATE_LIMIT_WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW || '900000'); // 15 minutes

// Environment
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const IS_PRODUCTION = NODE_ENV === 'production';
export const IS_DEVELOPMENT = NODE_ENV === 'development';

// Validation function to check required environment variables
export function validateEnvVars() {
  const requiredVars = [
    // Accept either public or server-only names for URL and anon key
    SUPABASE_URL ? null : 'NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL',
    SUPABASE_ANON_KEY ? null : 'NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY',
    // Make SUPABASE_SERVICE_ROLE_KEY optional for development
    SUPABASE_SERVICE_ROLE_KEY ? null : null
  ];

  const missingVars = requiredVars.filter((name) => typeof name === 'string') as string[];

  if (missingVars.length > 0) {
    console.warn(
      `Missing environment variables: ${missingVars.join(', ')}\n` +
      'Using simulation mode for development. For production, please set all required variables.'
    );
  }
}

// Call validation in development (server only) - but don't throw errors
if (IS_DEVELOPMENT && typeof window === 'undefined') {
  validateEnvVars();
}
