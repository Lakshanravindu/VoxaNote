"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Input, FileUpload } from '@/components/ui';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { PasswordStrength } from '@/components/ui/PasswordStrength';
import { UsernameInput } from '@/components/ui/UsernameInput';
import { validatePassword, isValidEmail } from '@/utils';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  bio: string;
  country: string;
  defaultLanguage: 'en' | 'si';
  socialMediaUrl: string;
  profilePhoto: File | null;
}

interface FormErrors {
  [key: string]: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [profilePreview, setProfilePreview] = useState<string>('');
  
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    bio: '',
    country: '',
    defaultLanguage: 'en',
    socialMediaUrl: '',
    profilePhoto: null
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const updateField = <T extends keyof FormData>(field: T, value: FormData[T]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };


  const handleFileSelect = (file: File | null) => {
    setFormData(prev => ({ ...prev, profilePhoto: file }));
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setProfilePreview('');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required fields
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    if (!formData.profilePhoto) newErrors.profilePhoto = 'Profile photo is required';

    // Email validation
    if (formData.email && !isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (formData.password) {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.errors[0];
      }
    }

    // Confirm password
    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Social media URL (required)
    if (!formData.socialMediaUrl.trim()) {
      newErrors.socialMediaUrl = 'Social media URL is required';
    } else {
      // Basic URL validation
      try {
        new URL(formData.socialMediaUrl);
      } catch {
        newErrors.socialMediaUrl = 'Please enter a valid URL';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('firstName', formData.firstName);
      submitData.append('lastName', formData.lastName);
      submitData.append('email', formData.email);
      submitData.append('username', formData.username);
      submitData.append('password', formData.password);
      submitData.append('confirmPassword', formData.confirmPassword);
      submitData.append('bio', formData.bio);
      submitData.append('country', formData.country);
      submitData.append('defaultLanguage', formData.defaultLanguage);
      submitData.append('socialMediaUrl', formData.socialMediaUrl);
      
      if (formData.profilePhoto) {
        submitData.append('profilePhoto', formData.profilePhoto);
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        body: submitData
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to OTP verification with email and userId
        const params = new URLSearchParams({
          email: formData.email,
          userId: data.userId
        });
        router.push(`/verify-otp?${params.toString()}`);
      } else {
        setErrors({ submit: data.error || 'Registration failed' });
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ submit: 'Registration failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 text-white flex items-center justify-center px-6 py-8">
      <div className="w-full max-w-2xl">
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
          <div className="text-center mb-8">
            {/* Logo inside form */}
            <Link href="/" className="flex items-center gap-3 justify-center mb-6">
              <div className="bg-blue-600 rounded-lg p-2 w-12 h-12 flex items-center justify-center">
                <span className="text-white font-bold text-xl">VN</span>
              </div>
            </Link>
            <h1 className="text-2xl font-semibold mb-2">
              <span className="text-white">Join Verto</span><span className="text-yellow-400">Note</span>
            </h1>
            <p className="text-gray-400">Create your account to start reading and engaging</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-300">Basic Information</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    value={formData.firstName}
                    onChange={(e) => updateField('firstName', e.target.value)}
                    error={errors.firstName}
                    placeholder="John"
                    required
                  />
                  <Input
                    label="Last Name"
                    value={formData.lastName}
                    onChange={(e) => updateField('lastName', e.target.value)}
                    error={errors.lastName}
                    placeholder="Doe"
                    required
                  />
                </div>

                <Input
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  error={errors.email}
                  placeholder="john@example.com"
                  required
                />

                <UsernameInput
                  value={formData.username}
                  onChange={(value) => updateField('username', value)}
                  error={errors.username}
                />
              </div>

              {/* Password */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-300">Security</h3>
                
                <div className="space-y-4">
                  <PasswordInput
                    label="Password"
                    value={formData.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    error={errors.password}
                    required
                  />
                  
                  <PasswordStrength password={formData.password} />
                  
                  <PasswordInput
                    label="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={(e) => updateField('confirmPassword', e.target.value)}
                    error={errors.confirmPassword}
                    required
                  />
                </div>
              </div>

              {/* Profile Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-300">Profile</h3>
                
                <FileUpload
                  onFileSelect={handleFileSelect}
                  preview={profilePreview}
                  error={errors.profilePhoto}
                  accept=".jpg,.jpeg,.png"
                  maxSize={50 * 1024 * 1024}
                  required
                />

                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label="Country"
                    value={formData.country}
                    onChange={(e) => updateField('country', e.target.value)}
                    placeholder="Sri Lanka"
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Preferred Language
                    </label>
                    <select
                      value={formData.defaultLanguage}
                      onChange={(e) => updateField('defaultLanguage', e.target.value as 'en' | 'si')}
                      className="block w-full rounded-lg border border-gray-600 bg-slate-700 px-3 py-2 text-white"
                    >
                      <option value="en">English</option>
                      <option value="si">සිංහල</option>
                    </select>
                  </div>
                </div>

                <Input
                  label="Bio"
                  value={formData.bio}
                  onChange={(e) => updateField('bio', e.target.value)}
                  placeholder="Tell us about yourself..."
                  helper="Optional - you can add this later"
                />
              </div>

              {/* Social Media URL */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-300">
                  Social Media <span className="text-red-400">*</span>
                </h3>
                <p className="text-sm text-gray-400">Add your Facebook, Instagram, LinkedIn, or TikTok profile URL</p>
                
                <Input
                  value={formData.socialMediaUrl}
                  onChange={(e) => updateField('socialMediaUrl', e.target.value)}
                  error={errors.socialMediaUrl}
                  placeholder="https://facebook.com/yourprofile or https://instagram.com/yourprofile"
                  required
                />
              </div>

              {/* Submit */}
              {errors.submit && (
                <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                  <p className="text-red-400">{errors.submit}</p>
                </div>
              )}

              <Button
                type="submit"
                loading={loading}
                fullWidth
                className="h-12 text-lg"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>

              <div className="text-center space-y-4">
                <div className="text-sm text-gray-400">
                  Already have an account?{' '}
                  <Link href="/login" className="text-blue-400 hover:text-blue-300">
                    Sign in instead
                  </Link>
                </div>
                
                <div className="text-sm text-gray-400">
                  By creating an account, you agree to our{' '}
                  <Link href="/terms" className="text-blue-400 hover:text-blue-300">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-blue-400 hover:text-blue-300">
                    Privacy Policy
                  </Link>
                </div>
              </div>
            </form>
        </div>
      </div>
    </div>
  );
}
