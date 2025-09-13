import { useState, useEffect, useCallback } from 'react';
import { Input } from './Input';
import { useDebounce } from '@/hooks';
import { cn } from '@/utils';

interface UsernameInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  className?: string;
}

interface UsernameStatus {
  available: boolean | null;
  loading: boolean;
  suggestions: string[];
  error?: string;
}

export function UsernameInput({ value, onChange, error, className }: UsernameInputProps) {
  const [status, setStatus] = useState<UsernameStatus>({
    available: null,
    loading: false,
    suggestions: []
  });

  const debouncedUsername = useDebounce(value, 500);

  const generateSuggestions = useCallback((baseUsername: string): string[] => {
    const suggestions = [];
    const cleanBase = baseUsername.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    
    // Add numbers
    for (let i = 1; i <= 5; i++) {
      suggestions.push(`${cleanBase}${Math.floor(Math.random() * 9999) + 1}`);
    }
    
    // Add prefixes/suffixes
    const prefixes = ['the', 'mr', 'ms'];
    const suffixes = ['official', 'real', 'lk'];
    
    prefixes.forEach(prefix => {
      suggestions.push(`${prefix}${cleanBase}${Math.floor(Math.random() * 99) + 1}`);
    });
    
    suffixes.forEach(suffix => {
      suggestions.push(`${cleanBase}${suffix}${Math.floor(Math.random() * 99) + 1}`);
    });
    
    return suggestions.slice(0, 3);
  }, []);

  const checkUsernameAvailability = useCallback(async (username: string) => {
    if (!username || username.length < 3) {
      setStatus({ available: null, loading: false, suggestions: [] });
      return;
    }

    setStatus(prev => ({ ...prev, loading: true, error: undefined }));

    try {
      const response = await fetch('/api/auth/check-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Username check response:', data); // Debug log

      if (data.success) {
        setStatus({
          available: data.available,
          loading: false,
          suggestions: data.available ? [] : generateSuggestions(username)
        });
      } else {
        console.error('Username check failed:', data.error);
        setStatus({
          available: null,
          loading: false,
          suggestions: [],
          error: data.error || 'Username check failed'
        });
      }
    } catch (error) {
      console.error('Username check error:', error);
      setStatus({
        available: null,
        loading: false,
        suggestions: [],
        error: 'Network error - could not check username'
      });
    }
  }, [generateSuggestions]);

  useEffect(() => {
    if (debouncedUsername) {
      checkUsernameAvailability(debouncedUsername);
    }
  }, [debouncedUsername, checkUsernameAvailability]);

  const formatUsername = (input: string): string => {
    // Remove spaces and special characters, keep only alphanumeric
    return input.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatUsername(e.target.value);
    onChange(formatted);
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
  };

  const getStatusIcon = () => {
    if (status.loading) {
      return (
        <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
      );
    }
    
    if (status.available === true) {
      return (
        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
    }
    
    if (status.available === false) {
      return (
        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
    }
    
    return null;
  };

  const getStatusMessage = () => {
    if (status.error) return status.error;
    if (status.loading) return 'Checking availability...';
    if (status.available === true) return 'Username is available!';
    if (status.available === false) return 'Username is already taken';
    return '';
  };

  const getStatusColor = () => {
    if (status.error) return 'text-red-400';
    if (status.loading) return 'text-blue-400';
    if (status.available === true) return 'text-green-400';
    if (status.available === false) return 'text-red-400';
    return 'text-gray-400';
  };

  return (
    <div className={cn('space-y-3', className)}>
      <Input
        label="Username"
        value={value}
        onChange={handleUsernameChange}
        placeholder="vertonote1234"
        error={error}
        rightIcon={getStatusIcon()}
        helper={
          <div className={cn('flex items-center justify-between', getStatusColor())}>
            <span className="text-sm">{getStatusMessage()}</span>
            {value && (
              <span className="text-xs text-gray-500">
                {value.length}/20 characters
              </span>
            )}
          </div>
        }
      />

      {/* Username Suggestions */}
      {status.suggestions.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm text-gray-400">Suggestions:</div>
          <div className="flex flex-wrap gap-2">
            {status.suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-sm text-blue-300 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
