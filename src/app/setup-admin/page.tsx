"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input, Button } from '@/components/ui';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  username: string;
  secretKey?: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function SetupAdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    username: '',
    secretKey: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState('');

  const updateField = <T extends keyof FormData>(field: T, value: FormData[T]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (submitError) {
      setSubmitError('');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Name validations
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setSubmitError('');

    try {
      const response = await fetch('/api/admin/create-first-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          username: formData.username,
          secretKey: formData.secretKey
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setSubmitError(data.error || 'Failed to create admin user');
      }
    } catch (error) {
      console.error('Admin creation error:', error);
      setSubmitError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 text-white flex items-center justify-center">
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 max-w-md w-full mx-4 text-center">
          <div className="bg-green-600 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl">✅</span>
          </div>
          <h1 className="text-2xl font-bold mb-4">Admin Created Successfully!</h1>
          <p className="text-gray-300 mb-6">
            Your admin account has been created. You can now login with your credentials.
          </p>
          <p className="text-sm text-gray-400">
            Redirecting to login page in a few seconds...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 text-white">
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-md mx-auto">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
            <div className="text-center mb-8">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-3 justify-center mb-6">
                <div className="bg-blue-600 rounded-lg p-2 w-12 h-12 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">Vt</span>
                </div>
                <span className="text-2xl font-semibold">
                  <span className="text-white">Verto</span><span className="text-yellow-400">Note</span>
                </span>
              </Link>
              
              <h1 className="text-2xl font-bold mb-2">Create First Admin</h1>
              <p className="text-gray-400 text-sm">
                Set up your admin account to manage the platform
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {submitError && (
                <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 text-red-300 text-sm">
                  {submitError}
                </div>
              )}

              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-200">Personal Information</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => updateField('firstName', e.target.value)}
                    error={errors.firstName}
                    placeholder="John"
                    required
                  />
                  <Input
                    label="Last Name"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => updateField('lastName', e.target.value)}
                    error={errors.lastName}
                    placeholder="Doe"
                    required
                  />
                </div>

                <Input
                  label="Username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => updateField('username', e.target.value)}
                  error={errors.username}
                  placeholder="admin"
                  required
                />
              </div>

              {/* Account Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-200">Account Information</h3>
                
                <Input
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  error={errors.email}
                  placeholder="admin@vertonote.com"
                  required
                />

                <Input
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  error={errors.password}
                  placeholder="Enter a strong password"
                  required
                />

                <Input
                  label="Confirm Password"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => updateField('confirmPassword', e.target.value)}
                  error={errors.confirmPassword}
                  placeholder="Confirm your password"
                  required
                />
              </div>

              {/* Production Secret Key */}
              {process.env.NODE_ENV === 'production' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-200">Security</h3>
                  <Input
                    label="Secret Key"
                    type="password"
                    value={formData.secretKey || ''}
                    onChange={(e) => updateField('secretKey', e.target.value)}
                    placeholder="Enter admin creation secret key"
                    required
                  />
                  <p className="text-xs text-gray-500">
                    This key is required in production for security
                  </p>
                </div>
              )}

              <Button
                type="submit"
                loading={loading}
                className="w-full"
              >
                Create Admin Account
              </Button>
            </form>

            <div className="text-center mt-6">
              <Link 
                href="/login" 
                className="text-blue-400 hover:text-blue-300 transition-colors text-sm"
              >
                ← Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
