"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui';

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // You could add logic here to verify the user actually completed OTP verification
    // For now, we'll assume they came from the OTP verification page
  }, []);

  const handleContinue = async () => {
    setLoading(true);
    
    // Simulate some processing time
    setTimeout(() => {
      router.push('/login?message=registration-complete');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 text-white">
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
            <div className="text-center mb-8">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-3 justify-center mb-6">
                <div className="bg-blue-600 rounded-lg p-2 w-12 h-12 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">Vt</span>
                </div>
                <span className="text-2xl font-semibold">
                  <span className="text-white">Welcome to Verto</span><span className="text-yellow-400">Note</span>
                </span>
              </Link>
            </div>

            {/* Success Message */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold mb-4">Email Verified Successfully! 🎉</h1>
              <p className="text-gray-300 text-lg mb-6">
                Your email has been verified and your account has been created.
              </p>
            </div>

            {/* Status Information */}
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-blue-300 mb-4">Account Status</h2>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-green-300">Email verified</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-yellow-300">Pending admin approval</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <span className="text-gray-300">Account activation (after approval)</span>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-slate-700/30 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">What happens next?</h2>
              
              <div className="space-y-4 text-gray-300">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Admin Review</h3>
                    <p className="text-sm">Our team will review your account within 24-48 hours.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Email Notification</h3>
                    <p className="text-sm">You'll receive an email once your account is approved.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Start Reading</h3>
                    <p className="text-sm">Once approved, you can sign in and start exploring articles.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="text-center">
                <Link 
                  href="/" 
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  Return to homepage
                </Link>
              </div>
            </div>

            {/* Contact Info */}
            <div className="mt-8 pt-6 border-t border-slate-700">
              <div className="text-center text-sm text-gray-400">
                <p className="mb-2">Questions about your account?</p>
                <a 
                  href="mailto:support@vertonote.com" 
                  className="text-blue-400 hover:text-blue-300"
                >
                  Contact our support team
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
