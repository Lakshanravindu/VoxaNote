import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui';

export function Header() {
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-slate-900 text-white border-b border-slate-700">
      <div className="container mx-auto px-6 py-4 lg:px-12">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-blue-600 rounded-lg p-2">
              <span className="text-white font-bold text-xl">Vt</span>
            </div>
            <span className="text-xl font-semibold">
              Verto<span className="text-yellow-400">Note</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link 
              href="/articles" 
              className="text-gray-300 hover:text-white transition-colors"
            >
              Articles
            </Link>
            <Link 
              href="/categories" 
              className="text-gray-300 hover:text-white transition-colors"
            >
              Categories
            </Link>
            <Link 
              href="/writers" 
              className="text-gray-300 hover:text-white transition-colors"
            >
              Writers
            </Link>
            <Link 
              href="/search" 
              className="text-gray-300 hover:text-white transition-colors"
            >
              Search
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">
                    Dashboard
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={signOut}
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button variant="primary" size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-slate-700">
            <nav className="flex flex-col gap-4 mt-4">
              <Link 
                href="/articles" 
                className="text-gray-300 hover:text-white transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Articles
              </Link>
              <Link 
                href="/categories" 
                className="text-gray-300 hover:text-white transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Categories
              </Link>
              <Link 
                href="/writers" 
                className="text-gray-300 hover:text-white transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Writers
              </Link>
              <Link 
                href="/search" 
                className="text-gray-300 hover:text-white transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Search
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
