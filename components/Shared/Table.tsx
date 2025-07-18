import React from 'react';
import { ChevronUpIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from './Icons';

// Table component interfaces
interface TableProps {
  children: React.ReactNode;
  className?: string;
}

interface TableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface TableBodyProps {
  children: React.ReactNode;
  className?: string;
}

interface TableRowProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  isClickable?: boolean;
}

interface TableHeaderCellProps {
  children: React.ReactNode;
  className?: string;
  sortable?: boolean;
  sortDirection?: 'asc' | 'desc' | null;
  onSort?: () => void;
}

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

interface TableEmptyStateProps {
  message: string;
  description?: string;
  action?: React.ReactNode;
  colSpan: number;
}

// Main Table component
export const Table: React.FC<TableProps> = ({ children, className = '' }) => {
  return (
    <div className="overflow-hidden bg-white shadow-sm border border-gray-200 rounded-lg">
      <div className="overflow-x-auto">
        <table className={`min-w-full divide-y divide-gray-200 ${className}`}>
          {children}
        </table>
      </div>
    </div>
  );
};

// Table Header component
export const TableHeader: React.FC<TableHeaderProps> = ({ children, className = '' }) => {
  return (
    <thead className={`bg-gray-50 ${className}`}>
      {children}
    </thead>
  );
};

// Table Body component
export const TableBody: React.FC<TableBodyProps> = ({ children, className = '' }) => {
  return (
    <tbody className={`bg-white divide-y divide-gray-200 ${className}`}>
      {children}
    </tbody>
  );
};

// Table Row component
export const TableRow: React.FC<TableRowProps> = ({ 
  children, 
  className = '', 
  onClick,
  isClickable = false 
}) => {
  const baseClasses = 'transition-colors duration-150';
  const hoverClasses = isClickable || onClick 
    ? 'hover:bg-gray-50 cursor-pointer' 
    : 'hover:bg-gray-25';
  
  return (
    <tr 
      className={`${baseClasses} ${hoverClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </tr>
  );
};

// Table Header Cell component
export const TableHeaderCell: React.FC<TableHeaderCellProps> = ({ 
  children, 
  className = '', 
  sortable = false,
  sortDirection = null,
  onSort
}) => {
  const baseClasses = 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider';
  const sortableClasses = sortable ? 'cursor-pointer hover:bg-gray-100 select-none' : '';
  
  const handleClick = () => {
    if (sortable && onSort) {
      onSort();
    }
  };

  return (
    <th 
      className={`${baseClasses} ${sortableClasses} ${className}`}
      onClick={handleClick}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortable && (
          <div className="flex flex-col">
            {sortDirection === 'asc' ? (
              <ChevronUpIcon size="xs" className="text-primary-600" />
            ) : sortDirection === 'desc' ? (
              <ChevronDownIcon size="xs" className="text-primary-600" />
            ) : (
              <div className="flex flex-col opacity-40">
                <ChevronUpIcon size="xs" className="-mb-1" />
                <ChevronDownIcon size="xs" />
              </div>
            )}
          </div>
        )}
      </div>
    </th>
  );
};

// Table Cell component
export const TableCell: React.FC<TableCellProps> = ({ 
  children, 
  className = '', 
  align = 'left' 
}) => {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  return (
    <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${alignClasses[align]} ${className}`}>
      {children}
    </td>
  );
};

// Table Empty State component
export const TableEmptyState: React.FC<TableEmptyStateProps> = ({ 
  message, 
  description, 
  action,
  colSpan 
}) => {
  return (
    <TableRow>
      <TableCell className="text-center py-12" align="center">
        <div colSpan={colSpan} className="flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-900 mb-1">{message}</h3>
            {description && (
              <p className="text-sm text-gray-500 mb-4">{description}</p>
            )}
            {action}
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
};

// Status Badge component for tables
interface StatusBadgeProps {
  status: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  children: React.ReactNode;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  children, 
  size = 'sm' 
}) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full';
  
  const sizeClasses = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm'
  };

  const statusClasses = {
    success: 'bg-success-100 text-success-800 border border-success-200',
    warning: 'bg-warning-100 text-warning-800 border border-warning-200',
    error: 'bg-error-100 text-error-800 border border-error-200',
    info: 'bg-primary-100 text-primary-800 border border-primary-200',
    neutral: 'bg-gray-100 text-gray-800 border border-gray-200'
  };

  return (
    <span className={`${baseClasses} ${sizeClasses[size]} ${statusClasses[status]}`}>
      {children}
    </span>
  );
};

// Action Button component for tables
interface TableActionButtonProps {
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'xs';
  children: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
}

export const TableActionButton: React.FC<TableActionButtonProps> = ({ 
  onClick, 
  variant = 'secondary', 
  size = 'xs',
  children,
  disabled = false,
  loading = false
}) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-md transition-colors duration-200 focus:outline-none focus:shadow-focus';
  
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm'
  };

  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 disabled:bg-primary-300',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400',
    danger: 'bg-error-600 text-white hover:bg-error-700 disabled:bg-error-300'
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
    >
      {children}
    </button>
  );
};

// Pagination component for tables
interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
}

export const TablePagination: React.FC<TablePaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{startItem}</span> to{' '}
            <span className="font-medium">{endItem}</span> of{' '}
            <span className="font-medium">{totalItems}</span> results
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeftIcon size="sm" />
            </button>
            
            {getVisiblePages().map((page, index) => (
              <React.Fragment key={index}>
                {page === '...' ? (
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    ...
                  </span>
                ) : (
                  <button
                    onClick={() => onPageChange(page as number)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      page === currentPage
                        ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                )}
              </React.Fragment>
            ))}
            
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRightIcon size="sm" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

// Export all table components
export default Table;
