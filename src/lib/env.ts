// Environment Variables Configuration

// Supabase Configuration
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Email Service
export const RESEND_API_KEY = process.env.RESEND_API_KEY!;

// Application Configuration
export const NEXTAUTH_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';
export const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET!;

// Email Configuration (Development - no domain required)
export const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';
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
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      'Please check your .env.local file and make sure all required variables are set.'
    );
  }
}

// Call validation in development
if (IS_DEVELOPMENT && typeof window === 'undefined') {
  validateEnvVars();
}
