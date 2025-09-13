"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Input } from '@/components/ui';

interface FormData {
  email: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function ResendOTPPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    email: searchParams?.get('email') || ''
  });

  // Get userId from URL params
  const userId = searchParams?.get('userId') || '';

  const [errors, setErrors] = useState<FormErrors>({});
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const updateField = <T extends keyof FormData>(field: T, value: FormData[T]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (message) {
      setMessage('');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Check if userId is available
    if (!userId) {
      newErrors.email = 'Email and userId are required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          userId: userId
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessage('OTP sent successfully! Please check your email.');
        setMessageType('success');
        
        // Redirect to OTP verification after 2 seconds
        setTimeout(() => {
          router.push(`/verify-otp?email=${encodeURIComponent(formData.email)}&userId=${encodeURIComponent(userId)}`);
        }, 2000);
      } else {
        setMessage(data.error || 'Failed to send OTP. Please try again.');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      setMessage('Network error. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
          <div className="text-center mb-8">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 justify-center mb-6">
              <div className="bg-blue-600 rounded-lg p-2 w-12 h-12 flex items-center justify-center">
                <span className="text-white font-bold text-xl">VN</span>
              </div>
            </Link>
            <h1 className="text-2xl font-semibold mb-2">
              <span className="text-white">Resend </span><span className="text-yellow-400">OTP</span>
            </h1>
            <p className="text-gray-400">Enter your email to receive a new verification code</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="Enter your email address"
                className="w-full"
                error={errors.email}
              />
            </div>

            {/* Message */}
            {message && (
              <div className={`${
                messageType === 'success' 
                  ? 'bg-green-900/20 border-green-500/30 text-green-300' 
                  : 'bg-red-900/20 border-red-500/30 text-red-300'
              } border rounded-lg p-4`}>
                <p className="text-sm text-center">{message}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              loading={loading}
              disabled={loading}
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </Button>

            {/* Back to Login Link */}
            <div className="text-center pt-4 border-t border-slate-700">
              <p className="text-gray-400 text-sm">
                Remember your password?{' '}
                <Link 
                  href="/login" 
                  className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

