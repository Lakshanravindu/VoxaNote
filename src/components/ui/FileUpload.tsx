import { useState, useRef, useCallback } from 'react';
import { cn } from '@/utils';

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  accept?: string;
  maxSize?: number;
  className?: string;
  preview?: string;
  error?: string;
  label?: string;
  required?: boolean;
}

export function FileUpload({
  onFileSelect,
  accept = '.jpg,.jpeg,.png',
  maxSize = 50 * 1024 * 1024, // 50MB
  className,
  preview,
  error,
  label = 'Profile Photo',
  required = false
}: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileValidation = useCallback((file: File): string | null => {
    // Check file size
    if (file.size > maxSize) {
      return `File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`;
    }

    // Check file type
    if (accept && !accept.split(',').some(type => {
      const cleanType = type.trim();
      if (cleanType.startsWith('.')) {
        return file.name.toLowerCase().endsWith(cleanType);
      }
      return file.type.match(new RegExp(cleanType.replace('*', '.*')));
    })) {
      return 'Please select a valid image file (JPG, JPEG, PNG)';
    }

    return null;
  }, [accept, maxSize]);

  const handleFileSelect = useCallback(async (file: File) => {
    const validationError = handleFileValidation(file);
    if (validationError) {
      // You might want to show this error through a toast or error state
      console.error(validationError);
      return;
    }

    setUploading(true);
    
    try {
      // Here you would typically upload to Supabase storage
      // For now, we'll just pass the file to the parent component
      onFileSelect(file);
    } catch (error) {
      console.error('File upload error:', error);
      onFileSelect(null);
    } finally {
      setUploading(false);
    }
  }, [handleFileValidation, onFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-300">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}
      
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'relative border-2 border-dashed rounded-xl p-6 transition-all cursor-pointer',
          'hover:border-blue-500/50 hover:bg-blue-500/5',
          dragOver && 'border-blue-500 bg-blue-500/10',
          error && 'border-red-500/50',
          'border-gray-600 bg-slate-800/50'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
        />

        {preview ? (
          <div className="space-y-4">
            <div className="relative mx-auto w-32 h-32">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover rounded-full border-4 border-blue-500/30"
              />
              {uploading && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />
                </div>
              )}
            </div>
            
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-300">Profile photo selected</p>
              <div className="flex justify-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClick();
                  }}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors"
                >
                  Change
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove();
                  }}
                  className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded-lg transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center">
              {uploading ? (
                <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />
              ) : (
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              )}
            </div>
            
            <div className="space-y-2">
              <p className="text-white font-medium">Upload Profile Photo</p>
              <p className="text-sm text-gray-400">
                Drag and drop your photo here, or click to browse
              </p>
              <p className="text-xs text-gray-500">
                JPG, JPEG or PNG • Max {Math.round(maxSize / (1024 * 1024))}MB
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}
