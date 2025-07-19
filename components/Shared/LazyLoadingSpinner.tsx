import React from 'react';

interface LazyLoadingSpinnerProps {
  message?: string;
}

const LazyLoadingSpinner: React.FC<LazyLoadingSpinnerProps> = ({ 
  message = "Loading..." 
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="text-4xl mb-4 animate-pulse">🇱🇷</div>
        <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-2">
          EduTrack
        </h2>
        <p className="text-blue-700 dark:text-blue-400 font-medium mb-4">
          {message}
        </p>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </div>
      </div>
    </div>
  );
};

export default LazyLoadingSpinner;
