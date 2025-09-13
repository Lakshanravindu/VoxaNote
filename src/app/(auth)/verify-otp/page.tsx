"use client";

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui';

function VerifyOTPContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const userId = searchParams.get('userId');

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [timeLeft, setTimeLeft] = useState(5 * 60); // 5 minutes in seconds

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) {
      router.push('/register');
      return;
    }

    // Start countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [email, router]);

  useEffect(() => {
    // Handle resend cooldown
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
      handleVerifyOTP(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const digits = pastedData.replace(/\D/g, '').slice(0, 6);
    
    if (digits.length === 6) {
      const newOtp = digits.split('');
      setOtp(newOtp);
      handleVerifyOTP(digits);
    }
  };

  const handleVerifyOTP = async (otpCode?: string) => {
    const codeToVerify = otpCode || otp.join('');
    
    if (codeToVerify.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          otp: codeToVerify
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Email verified successfully! Redirecting to onboarding...');
        setTimeout(() => {
          router.push('/onboarding');
        }, 2000);
      } else {
        setError(data.error || 'Invalid OTP');
        setAttemptsLeft(data.attemptsLeft || 0);
        setOtp(['', '', '', '', '', '']); // Clear OTP fields
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;

    setResendLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          userId
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('New OTP sent to your email');
        setResendCooldown(5 * 60); // 5 minutes cooldown
        setTimeLeft(5 * 60); // Reset timer
        setAttemptsLeft(3); // Reset attempts
        setOtp(['', '', '', '', '', '']); // Clear current OTP
        inputRefs.current[0]?.focus();
        
        // Show simulation OTP in development
        if (data.simulationOTP) {
          console.log('Development OTP:', data.simulationOTP);
        }
      } else {
        // Handle 15 minute restriction error
        if (response.status === 429) {
          setError(data.error || 'Please wait 5 minutes before requesting a new OTP');
        } else {
          setError(data.error || 'Failed to resend OTP');
        }
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      setError('Network error. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (!email) {
    return null; // Will redirect
  }

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
              
              <h1 className="text-2xl font-bold mb-2">Verify Your Email</h1>
              <p className="text-gray-400">
                We&apos;ve sent a 6-digit code to{' '}
                <span className="text-blue-400">{email}</span>
              </p>
            </div>

            {/* OTP Input */}
            <div className="mb-6">
              <div className="flex gap-3 justify-center mb-4">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-12 h-14 text-center text-xl font-bold bg-slate-700 border border-slate-600 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                    disabled={loading}
                  />
                ))}
              </div>
              
              {/* Timer */}
              <div className="text-center text-sm text-gray-400">
                {timeLeft > 0 ? (
                  <span>Code expires in {formatTime(timeLeft)}</span>
                ) : (
                  <span className="text-red-400">Code expired</span>
                )}
              </div>
            </div>

            {/* Messages */}
            {error && (
              <div className="mb-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
                {attemptsLeft > 0 && (
                  <p className="text-red-300 text-xs mt-1">
                    {attemptsLeft} attempt{attemptsLeft !== 1 ? 's' : ''} remaining
                  </p>
                )}
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                <p className="text-green-400 text-sm">{success}</p>
              </div>
            )}

            {/* Verify Button */}
            <Button
              onClick={() => handleVerifyOTP()}
              loading={loading}
              disabled={otp.some(digit => !digit) || timeLeft === 0}
              fullWidth
              className="h-12 text-lg mb-4"
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </Button>

            {/* Resend OTP */}
            <div className="text-center space-y-4">
              <div className="text-sm text-gray-400">
                    Didn&apos;t receive the code?{' '}
                <button
                  onClick={handleResendOTP}
                  disabled={resendCooldown > 0 || resendLoading}
                  className="text-blue-400 hover:text-blue-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                >
                  {resendLoading ? (
                    'Sending...'
                  ) : resendCooldown > 0 ? (
                    `Resend in ${resendCooldown}s`
                  ) : (
                    'Resend code'
                  )}
                </button>
              </div>
              
              <div className="text-sm text-gray-400">
                Wrong email?{' '}
                <Link href="/register" className="text-blue-400 hover:text-blue-300">
                  Go back to registration
                </Link>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Loading verification page...</p>
        </div>
      </div>
    }>
      <VerifyOTPContent />
    </Suspense>
  );
}
