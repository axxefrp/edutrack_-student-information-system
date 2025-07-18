
import React from 'react';
import { LoadingIcon } from './Icons';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  ...props
}) => {
  const baseStyles = 'font-medium rounded-lg shadow-sm focus:outline-none focus:shadow-focus transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center border-2 border-transparent';

  const variantStyles = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 focus:shadow-focus dark:bg-primary-500 dark:hover:bg-primary-600 dark:active:bg-primary-700',
    secondary: 'bg-secondary-600 text-white hover:bg-secondary-700 active:bg-secondary-800 focus:shadow-focus dark:bg-secondary-500 dark:hover:bg-secondary-600 dark:active:bg-secondary-700',
    success: 'bg-success-600 text-white hover:bg-success-700 active:bg-success-800 focus:shadow-focus-success dark:bg-success-500 dark:hover:bg-success-600 dark:active:bg-success-700',
    warning: 'bg-warning-600 text-white hover:bg-warning-700 active:bg-warning-800 focus:shadow-focus dark:bg-warning-500 dark:hover:bg-warning-600 dark:active:bg-warning-700',
    danger: 'bg-error-600 text-white hover:bg-error-700 active:bg-error-800 focus:shadow-focus-error dark:bg-error-500 dark:hover:bg-error-600 dark:active:bg-error-700',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-50 active:bg-gray-100 focus:shadow-focus border-gray-300 hover:border-gray-400 dark:text-gray-300 dark:hover:bg-gray-800 dark:active:bg-gray-700 dark:border-gray-600 dark:hover:border-gray-500',
  };

  const sizeStyles = {
    xs: 'px-2 py-1 text-xs min-h-[24px]',
    sm: 'px-3 py-1.5 text-sm min-h-[32px]',
    md: 'px-4 py-2 text-sm min-h-[40px]',
    lg: 'px-6 py-3 text-base min-h-[48px]',
    xl: 'px-8 py-4 text-lg min-h-[56px]',
  };

  return (
    <button
      type="button"
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <LoadingIcon size="sm" className="-ml-1 mr-2" />
      )}
      {children}
    </button>
  );
};

export default Button;
