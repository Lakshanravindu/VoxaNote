import { useMemo } from 'react';
import { cn } from '@/utils';

interface PasswordStrengthProps {
  password: string;
  className?: string;
}

interface StrengthCriteria {
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSymbol: boolean;
}

export function PasswordStrength({ password, className }: PasswordStrengthProps) {
  const criteria = useMemo((): StrengthCriteria => ({
    hasMinLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSymbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  }), [password]);

  const strength = useMemo(() => {
    const criteriaCount = Object.values(criteria).filter(Boolean).length;
    
    if (criteriaCount === 0) return { level: 0, text: '', color: '' };
    if (criteriaCount <= 2) return { level: 1, text: 'Weak', color: 'bg-red-500' };
    if (criteriaCount <= 3) return { level: 2, text: 'Fair', color: 'bg-orange-500' };
    if (criteriaCount <= 4) return { level: 3, text: 'Good', color: 'bg-yellow-500' };
    return { level: 4, text: 'Strong', color: 'bg-green-500' };
  }, [criteria]);

  if (!password) return null;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Strength Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Password Strength</span>
          <span className={cn(
            'font-medium',
            strength.level === 1 && 'text-red-400',
            strength.level === 2 && 'text-orange-400',
            strength.level === 3 && 'text-yellow-400',
            strength.level === 4 && 'text-green-400'
          )}>
            {strength.text}
          </span>
        </div>
        
        <div className="flex gap-1">
          {[1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={cn(
                'h-2 flex-1 rounded-full transition-colors',
                level <= strength.level 
                  ? strength.color 
                  : 'bg-gray-600'
              )}
            />
          ))}
        </div>
      </div>

      {/* Criteria Checklist */}
      <div className="space-y-2">
        <div className="text-sm text-gray-400">Requirements:</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          <div className={cn(
            'flex items-center gap-2 transition-colors',
            criteria.hasMinLength ? 'text-green-400' : 'text-gray-500'
          )}>
            <div className={cn(
              'w-4 h-4 rounded-full border-2 flex items-center justify-center',
              criteria.hasMinLength 
                ? 'bg-green-500 border-green-500' 
                : 'border-gray-500'
            )}>
              {criteria.hasMinLength && (
                <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span>At least 8 characters</span>
          </div>

          <div className={cn(
            'flex items-center gap-2 transition-colors',
            criteria.hasUppercase ? 'text-green-400' : 'text-gray-500'
          )}>
            <div className={cn(
              'w-4 h-4 rounded-full border-2 flex items-center justify-center',
              criteria.hasUppercase 
                ? 'bg-green-500 border-green-500' 
                : 'border-gray-500'
            )}>
              {criteria.hasUppercase && (
                <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span>One uppercase letter</span>
          </div>

          <div className={cn(
            'flex items-center gap-2 transition-colors',
            criteria.hasLowercase ? 'text-green-400' : 'text-gray-500'
          )}>
            <div className={cn(
              'w-4 h-4 rounded-full border-2 flex items-center justify-center',
              criteria.hasLowercase 
                ? 'bg-green-500 border-green-500' 
                : 'border-gray-500'
            )}>
              {criteria.hasLowercase && (
                <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span>One lowercase letter</span>
          </div>

          <div className={cn(
            'flex items-center gap-2 transition-colors',
            criteria.hasNumber ? 'text-green-400' : 'text-gray-500'
          )}>
            <div className={cn(
              'w-4 h-4 rounded-full border-2 flex items-center justify-center',
              criteria.hasNumber 
                ? 'bg-green-500 border-green-500' 
                : 'border-gray-500'
            )}>
              {criteria.hasNumber && (
                <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span>One number</span>
          </div>

          <div className={cn(
            'flex items-center gap-2 transition-colors',
            criteria.hasSymbol ? 'text-green-400' : 'text-gray-500'
          )}>
            <div className={cn(
              'w-4 h-4 rounded-full border-2 flex items-center justify-center',
              criteria.hasSymbol 
                ? 'bg-green-500 border-green-500' 
                : 'border-gray-500'
            )}>
              {criteria.hasSymbol && (
                <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span>One symbol (!@#$%...)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
