"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Input } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';

interface LoginFormData {
  emailOrUsername: string;
  password: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuthStore();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<LoginFormData>({
    emailOrUsername: '',
    password: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const updateField = <T extends keyof LoginFormData>(field: T, value: LoginFormData[T]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (loginError) {
      setLoginError('');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.emailOrUsername.trim()) {
      newErrors.emailOrUsername = 'Email or username is required';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setLoginError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailOrUsername: formData.emailOrUsername,
          password: formData.password
        })
      });

      const data = await response.json();
      console.log('Login API Response:', data);

      if (data.success) {
        console.log('Login successful, user data:', data.user);
        console.log('User status:', data.user.status);
        console.log('User role:', data.user.role);
        
        // Save user to AuthStore
        login(data.user);
        console.log('User saved to AuthStore');
        
        // Check user status for redirect logic
        if (data.user.status === 'approved') {
          console.log('User approved, redirecting based on role...');
          // Fully approved user - redirect based on role
          switch (data.user.role) {
            case 'reader':
              console.log('Redirecting to /reader');
              router.push('/reader');
              break;
            case 'writer':
              console.log('Redirecting to /writer');
              router.push('/writer');
              break;
            case 'admin':
              console.log('Redirecting to /admin');
              // Try multiple redirect methods
              router.replace('/admin');
              // Also try push as fallback
              router.push('/admin');
              // Force page refresh if redirect doesn't work
              setTimeout(() => {
                console.log('Current pathname:', window.location.pathname);
                if (window.location.pathname === '/login') {
                  console.log('Router redirect failed, using window.location');
                  window.location.href = '/admin';
                }
              }, 1000);
              break;
            default:
              console.log('Redirecting to /dashboard (fallback)');
              router.push('/dashboard'); // fallback
          }
        } else if (data.user.status === 'email_verified') {
          console.log('User email verified but not approved, redirecting to onboarding');
          // Email verified but not admin approved - redirect to onboarding
          router.push('/onboarding');
        } else {
          console.log('User status not recognized:', data.user.status);
          // Handle other statuses (shouldn't reach here due to API validation)
          setLoginError('Account not properly activated. Please contact support.');
        }
      } else {
        // Check if the error is about email verification
        if (data.error === 'Please verify your email first' || data.redirectTo === 'resend-otp') {
          // Use email from API response if available, otherwise try to extract from input
          const email = data.email || (formData.emailOrUsername.includes('@') 
            ? formData.emailOrUsername 
            : '');
          const username = data.username || formData.emailOrUsername;
          
          const userId = data.userId;
          console.log('Redirecting to OTP verification:', { email, username, userId });
          router.push(`/resend-otp?email=${encodeURIComponent(email)}&username=${encodeURIComponent(username)}&userId=${encodeURIComponent(userId)}`);
        } else {
          setLoginError(data.error || 'Login failed. Please check your credentials.');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
          <div className="text-center mb-8">
            {/* Logo inside form */}
            <Link href="/" className="flex items-center gap-3 justify-center mb-6">
              <div className="bg-blue-600 rounded-lg p-2 w-12 h-12 flex items-center justify-center">
                <span className="text-white font-bold text-xl">VN</span>
              </div>
            </Link>
            <h1 className="text-2xl font-semibold mb-2">
              <span className="text-white">Welcome back to Verto</span><span className="text-yellow-400">Note</span>
            </h1>
            <p className="text-gray-400">Sign in to continue reading and engaging</p>
          </div>

          {/* Success message from registration */}
          {searchParams?.get('message') === 'registration-complete' && (
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mb-6">
                <p className="text-green-300 text-sm text-center">
                  Registration completed successfully! Please sign in to continue.
                </p>
              </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email or Username */}
            <div>
              <label htmlFor="emailOrUsername" className="block text-sm font-medium text-gray-300 mb-2">
                Email or Username
              </label>
              <Input
                id="emailOrUsername"
                type="text"
                value={formData.emailOrUsername}
                onChange={(e) => updateField('emailOrUsername', e.target.value)}
                placeholder="Enter your email or username"
                className="w-full"
                error={errors.emailOrUsername}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pr-12"
                  error={errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Login Error */}
            {loginError && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                <p className="text-red-300 text-sm text-center">{loginError}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              loading={loading}
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>

            {/* Forgot Password Link */}
            <div className="text-center">
              <Link 
                href="/auth/forgot-password" 
                className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
              >
                Forgot your password?
              </Link>
            </div>

            {/* Register Link */}
            <div className="text-center pt-4 border-t border-slate-700">
              <p className="text-gray-400 text-sm">
                Don&apos;t have an account?{' '}
                <Link 
                  href="/register" 
                  className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  Sign up here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
