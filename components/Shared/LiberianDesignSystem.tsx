import React from 'react';
import { LiberianGradeScale } from '../../types';
import { LIBERIAN_GRADE_SCALE } from '../../utils/liberianGradingSystem';

// ===== LIBERIAN CULTURAL HEADER COMPONENT =====
interface LiberianHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
}

export const LiberianHeader: React.FC<LiberianHeaderProps> = ({
  title,
  subtitle,
  children,
  className = ''
}) => {
  return (
    <div className={`liberian-header ${className}`}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-red-700 dark:text-red-400">{title}</h1>
          {subtitle && (
            <p className="text-blue-700 dark:text-blue-400 mt-1 font-medium">{subtitle}</p>
          )}
        </div>
        {children && (
          <div className="flex items-center space-x-4">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

// ===== LIBERIAN CULTURAL CARD COMPONENT =====
interface LiberianCardProps {
  children: React.ReactNode;
  type?: 'default' | 'national-holiday' | 'cultural-event' | 'academic-event';
  className?: string;
  onClick?: () => void;
}

export const LiberianCard: React.FC<LiberianCardProps> = ({ 
  children, 
  type = 'default', 
  className = '', 
  onClick 
}) => {
  const cardClass = `liberian-card ${type !== 'default' ? type : ''} ${className}`;
  
  if (onClick) {
    return (
      <div className={`${cardClass} cursor-pointer`} onClick={onClick}>
        {children}
      </div>
    );
  }
  
  return (
    <div className={cardClass}>
      {children}
    </div>
  );
};

// ===== LIBERIAN CULTURAL BUTTON COMPONENT =====
interface LiberianButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'cultural' | 'moe';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export const LiberianButton: React.FC<LiberianButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  loading = false,
  className = '',
  type = 'button'
}) => {
  const baseClass = 'liberian-button';
  const variantClass = `liberian-button-${variant}`;
  const sizeClass = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  }[size];
  
  const buttonClass = `${baseClass} ${variantClass} ${sizeClass} ${className} ${
    disabled || loading ? 'opacity-50 cursor-not-allowed' : ''
  }`;
  
  return (
    <button
      type={type}
      className={buttonClass}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? (
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Loading...
        </div>
      ) : (
        children
      )}
    </button>
  );
};

// ===== WAEC GRADE BADGE COMPONENT =====
interface WAECGradeBadgeProps {
  grade: LiberianGradeScale;
  showDescription?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const WAECGradeBadge: React.FC<WAECGradeBadgeProps> = ({
  grade,
  showDescription = false,
  size = 'md',
  className = ''
}) => {
  const gradeInfo = LIBERIAN_GRADE_SCALE[grade];
  const badgeType = gradeInfo.isCredit ? 'credit' : gradeInfo.description === 'Fail' ? 'fail' : 'pass';
  
  const sizeClass = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2 text-base'
  }[size];
  
  return (
    <span className={`liberian-waec-badge ${badgeType} ${sizeClass} ${className}`}>
      🇱🇷 {grade}
      {showDescription && ` - ${gradeInfo.description}`}
    </span>
  );
};

// ===== MINISTRY OF EDUCATION INDICATOR COMPONENT =====
interface MoEIndicatorProps {
  text: string;
  status?: 'compliant' | 'partial' | 'non-compliant';
  className?: string;
}

export const MoEIndicator: React.FC<MoEIndicatorProps> = ({
  text,
  status = 'compliant',
  className = ''
}) => {
  const statusClass = {
    compliant: 'bg-green-600 dark:bg-green-500',
    partial: 'bg-yellow-600 dark:bg-yellow-500',
    'non-compliant': 'bg-red-600 dark:bg-red-500'
  }[status];

  return (
    <span className={`liberian-moe-indicator ${statusClass} text-white dark:text-gray-900 ${className}`}>
      {text}
    </span>
  );
};

// ===== LIBERIAN STATUS INDICATOR COMPONENT =====
interface LiberianStatusProps {
  status: 'excellent' | 'good' | 'needs-improvement' | 'critical';
  text: string;
  className?: string;
}

export const LiberianStatus: React.FC<LiberianStatusProps> = ({
  status,
  text,
  className = ''
}) => {
  const statusClass = `liberian-status-${status}`;
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusClass} ${className}`}>
      {text}
    </span>
  );
};

// ===== LIBERIAN LOADING COMPONENT =====
interface LiberianLoadingProps {
  text?: string;
  className?: string;
}

export const LiberianLoading: React.FC<LiberianLoadingProps> = ({
  text = 'Loading Liberian educational data...',
  className = ''
}) => {
  return (
    <div className={`liberian-loading ${className}`}>
      <div className="text-center">
        <div className="text-4xl mb-4 animate-pulse">🇱🇷</div>
        <p className="text-blue-700 font-medium">{text}</p>
      </div>
    </div>
  );
};

// ===== LIBERIAN EMPTY STATE COMPONENT =====
interface LiberianEmptyStateProps {
  title: string;
  description: string;
  icon?: string;
  action?: React.ReactNode;
  className?: string;
}

export const LiberianEmptyState: React.FC<LiberianEmptyStateProps> = ({
  title,
  description,
  icon = '📚',
  action,
  className = ''
}) => {
  return (
    <div className={`liberian-empty-state ${className}`}>
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-blue-700 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};

// ===== LIBERIAN NAVIGATION TAB COMPONENT =====
interface LiberianTabProps {
  tabs: Array<{
    key: string;
    label: string;
    icon?: string;
  }>;
  activeTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
}

export const LiberianTabs: React.FC<LiberianTabProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className = ''
}) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow mb-6 ${className}`}>
      <div className="border-b border-gray-200 dark:border-gray-600">
        <nav className="-mb-px flex space-x-8 px-6">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.key
                  ? 'border-red-500 dark:border-red-400 text-red-600 dark:text-red-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              {tab.icon && <span className="mr-2">{tab.icon}</span>}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

// ===== LIBERIAN METRIC CARD COMPONENT =====
interface LiberianMetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'stable';
  color?: 'red' | 'blue' | 'green' | 'yellow' | 'purple';
  icon?: string;
  className?: string;
}

export const LiberianMetricCard: React.FC<LiberianMetricCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  color = 'blue',
  icon,
  className = ''
}) => {
  const colorClasses = {
    red: 'border-red-600 bg-red-50 dark:border-red-400 dark:bg-red-900/20',
    blue: 'border-blue-600 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20',
    green: 'border-green-600 bg-green-50 dark:border-green-400 dark:bg-green-900/20',
    yellow: 'border-yellow-600 bg-yellow-50 dark:border-yellow-400 dark:bg-yellow-900/20',
    purple: 'border-purple-600 bg-purple-50 dark:border-purple-400 dark:bg-purple-900/20'
  };

  const textColorClasses = {
    red: 'text-red-700 dark:text-red-300',
    blue: 'text-blue-700 dark:text-blue-300',
    green: 'text-green-700 dark:text-green-300',
    yellow: 'text-yellow-700 dark:text-yellow-300',
    purple: 'text-purple-700 dark:text-purple-300'
  };

  const valueColorClasses = {
    red: 'text-red-600 dark:text-red-400',
    blue: 'text-blue-600 dark:text-blue-400',
    green: 'text-green-600 dark:text-green-400',
    yellow: 'text-yellow-600 dark:text-yellow-400',
    purple: 'text-purple-600 dark:text-purple-400'
  };
  
  return (
    <div className={`bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-l-4 ${colorClasses[color]} ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <p className={`text-sm font-medium uppercase tracking-wider ${textColorClasses[color]}`}>
          {title}
        </p>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>
      <p className={`text-3xl font-bold ${valueColorClasses[color]}`}>{value}</p>
      {subtitle && (
        <div className="flex items-center mt-2">
          {trend && (
            <span className={`text-sm mr-2 ${
              trend === 'up' ? 'text-green-600 dark:text-green-400' :
              trend === 'down' ? 'text-red-600 dark:text-red-400' :
              'text-gray-600 dark:text-gray-400'
            }`}>
              {trend === 'up' ? '↗️' : trend === 'down' ? '↘️' : '➡️'}
            </span>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
        </div>
      )}
    </div>
  );
};

// ===== LIBERIAN PROGRESS BAR COMPONENT =====
interface LiberianProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  color?: 'red' | 'blue' | 'green' | 'yellow';
  showPercentage?: boolean;
  className?: string;
}

export const LiberianProgressBar: React.FC<LiberianProgressBarProps> = ({
  value,
  max = 100,
  label,
  color = 'blue',
  showPercentage = true,
  className = ''
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  const colorClasses = {
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500'
  };
  
  return (
    <div className={className}>
      {label && (
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>{label}</span>
          {showPercentage && <span>{percentage.toFixed(1)}%</span>}
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div 
          className={`h-3 rounded-full transition-all duration-300 ${colorClasses[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// ===== LIBERIAN ALERT COMPONENT =====
interface LiberianAlertProps {
  type: 'success' | 'warning' | 'error' | 'info';
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const LiberianAlert: React.FC<LiberianAlertProps> = ({
  type,
  title,
  children,
  className = ''
}) => {
  const typeClasses = {
    success: 'bg-green-50 border-green-400 text-green-800',
    warning: 'bg-yellow-50 border-yellow-400 text-yellow-800',
    error: 'bg-red-50 border-red-400 text-red-800',
    info: 'bg-blue-50 border-blue-400 text-blue-800'
  };
  
  const icons = {
    success: '✅',
    warning: '⚠️',
    error: '❌',
    info: 'ℹ️'
  };
  
  return (
    <div className={`p-4 rounded-lg border-l-4 ${typeClasses[type]} ${className}`}>
      <div className="flex items-start">
        <span className="text-xl mr-3">{icons[type]}</span>
        <div>
          {title && <h4 className="font-semibold mb-2">{title}</h4>}
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
};
