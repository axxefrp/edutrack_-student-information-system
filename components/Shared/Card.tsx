import React from 'react';

// Card component interfaces
interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
  hover?: boolean;
  onClick?: () => void;
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
  border?: boolean;
}

interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
  border?: boolean;
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

// Main Card component
export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  padding = 'md',
  shadow = 'md',
  border = true,
  hover = false,
  onClick
}) => {
  const baseClasses = 'bg-white rounded-lg overflow-hidden transition-all duration-200';
  
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg'
  };

  const borderClasses = border ? 'border border-gray-200' : '';
  const hoverClasses = hover ? 'hover:shadow-lg hover:-translate-y-1' : '';
  const clickableClasses = onClick ? 'cursor-pointer' : '';

  return (
    <div 
      className={`${baseClasses} ${paddingClasses[padding]} ${shadowClasses[shadow]} ${borderClasses} ${hoverClasses} ${clickableClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

// Card Header component
export const CardHeader: React.FC<CardHeaderProps> = ({ 
  children, 
  className = '', 
  border = true 
}) => {
  const baseClasses = 'px-6 py-4 bg-gray-50';
  const borderClasses = border ? 'border-b border-gray-200' : '';

  return (
    <div className={`${baseClasses} ${borderClasses} ${className}`}>
      {children}
    </div>
  );
};

// Card Body component
export const CardBody: React.FC<CardBodyProps> = ({ 
  children, 
  className = '', 
  padding = 'md' 
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <div className={`${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  );
};

// Card Footer component
export const CardFooter: React.FC<CardFooterProps> = ({ 
  children, 
  className = '', 
  border = true 
}) => {
  const baseClasses = 'px-6 py-4 bg-gray-50';
  const borderClasses = border ? 'border-t border-gray-200' : '';

  return (
    <div className={`${baseClasses} ${borderClasses} ${className}`}>
      {children}
    </div>
  );
};

// Card Title component
export const CardTitle: React.FC<CardTitleProps> = ({ 
  children, 
  className = '', 
  level = 3 
}) => {
  const baseClasses = 'font-semibold text-gray-900 mb-2';
  
  const levelClasses = {
    1: 'text-3xl',
    2: 'text-2xl',
    3: 'text-xl',
    4: 'text-lg',
    5: 'text-base',
    6: 'text-sm'
  };

  const Tag = `h${level}` as keyof JSX.IntrinsicElements;

  return (
    <Tag className={`${baseClasses} ${levelClasses[level]} ${className}`}>
      {children}
    </Tag>
  );
};

// Card Description component
export const CardDescription: React.FC<CardDescriptionProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <p className={`text-gray-600 text-sm leading-relaxed ${className}`}>
      {children}
    </p>
  );
};

// Card Grid component for layouts
interface CardGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
}

export const CardGrid: React.FC<CardGridProps> = ({ 
  children, 
  className = '', 
  cols = 3,
  gap = 'md'
}) => {
  const colClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8'
  };

  return (
    <div className={`grid ${colClasses[cols]} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
};

// Stat Card component for dashboards
interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string | number;
    type: 'increase' | 'decrease' | 'neutral';
  };
  icon?: React.ReactNode;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  change, 
  icon, 
  className = '' 
}) => {
  const changeColors = {
    increase: 'text-success-600',
    decrease: 'text-error-600',
    neutral: 'text-gray-500'
  };

  const changeIcons = {
    increase: '↗',
    decrease: '↘',
    neutral: '→'
  };

  return (
    <Card className={`${className}`} hover>
      <CardBody>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {change && (
              <div className={`flex items-center mt-2 text-sm ${changeColors[change.type]}`}>
                <span className="mr-1">{changeIcons[change.type]}</span>
                <span>{change.value}</span>
              </div>
            )}
          </div>
          {icon && (
            <div className="flex-shrink-0 ml-4">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
                {icon}
              </div>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

// Feature Card component
interface FeatureCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ 
  title, 
  description, 
  icon, 
  action, 
  className = '' 
}) => {
  return (
    <Card className={`${className}`} hover>
      <CardBody>
        {icon && (
          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 mb-4">
            {icon}
          </div>
        )}
        <CardTitle level={4}>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        {action && (
          <div className="mt-4">
            {action}
          </div>
        )}
      </CardBody>
    </Card>
  );
};

// Alert Card component
interface AlertCardProps {
  type: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

export const AlertCard: React.FC<AlertCardProps> = ({ 
  type, 
  title, 
  children, 
  dismissible = false, 
  onDismiss, 
  className = '' 
}) => {
  const typeStyles = {
    info: 'bg-primary-50 border-primary-200 text-primary-800',
    success: 'bg-success-50 border-success-200 text-success-800',
    warning: 'bg-warning-50 border-warning-200 text-warning-800',
    error: 'bg-error-50 border-error-200 text-error-800'
  };

  const iconColors = {
    info: 'text-primary-400',
    success: 'text-success-400',
    warning: 'text-warning-400',
    error: 'text-error-400'
  };

  const icons = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌'
  };

  return (
    <div className={`rounded-lg border p-4 ${typeStyles[type]} ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <span className={`text-lg ${iconColors[type]}`}>{icons[type]}</span>
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className="text-sm font-medium mb-1">{title}</h3>
          )}
          <div className="text-sm">{children}</div>
        </div>
        {dismissible && onDismiss && (
          <div className="ml-auto pl-3">
            <button
              onClick={onDismiss}
              className={`inline-flex rounded-md p-1.5 focus:outline-none focus:shadow-focus hover:bg-black hover:bg-opacity-10 ${iconColors[type]}`}
            >
              <span className="sr-only">Dismiss</span>
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Export all card components
export default Card;
