
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  id?: string;
  className?: string;
  error?: string;
  helpText?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Input: React.FC<InputProps> = ({
  label,
  id,
  className = '',
  error,
  helpText,
  size = 'md',
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  const sizeStyles = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-sm',
    lg: 'px-4 py-4 text-base',
  };

  const baseInputStyles = `
    block w-full border-2 rounded-lg shadow-sm
    focus:outline-none focus:shadow-focus
    transition-all duration-200 ease-in-out
    placeholder-gray-400 dark:placeholder-gray-500
    bg-white dark:bg-gray-800
    text-gray-900 dark:text-gray-100
    ${sizeStyles[size]}
  `;

  const inputStateStyles = error
    ? 'border-error-500 focus:border-error-600 focus:shadow-focus-error dark:border-error-400 dark:focus:border-error-500'
    : 'border-gray-300 focus:border-primary-500 hover:border-gray-400 dark:border-gray-600 dark:focus:border-primary-400 dark:hover:border-gray-500';

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
          {props.required && <span className="text-error-500 dark:text-error-400 ml-1">*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={`${baseInputStyles} ${inputStateStyles} ${className}`}
        {...props}
      />
      {helpText && !error && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex items-center">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          {helpText}
        </p>
      )}
      {error && (
        <p className="mt-1 text-sm text-error-600 dark:text-error-400 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;