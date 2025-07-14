'use client';

import React from 'react';
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { Reservation } from '@/types';

interface StatusBadgeProps {
  status: Reservation['status'];
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  showIcon = false, 
  size = 'md' 
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'confirmed':
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          classes: 'bg-secondary-100 dark:bg-secondary-900/30 text-secondary-800 dark:text-secondary-300 border-secondary-200 dark:border-secondary-800',
          label: 'Confirmed'
        };
      case 'pending':
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          classes: 'bg-accent-100 dark:bg-accent-900/30 text-accent-800 dark:text-accent-300 border-accent-200 dark:border-accent-800',
          label: 'Pending'
        };
      case 'cancelled':
        return {
          icon: <XCircle className="h-4 w-4" />,
          classes: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800',
          label: 'Cancelled'
        };
    }
  };

  const config = getStatusConfig();
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm'
  };

  return (
    <span className={`
      inline-flex items-center gap-1 rounded-full font-medium border transition-colors
      ${config.classes} 
      ${sizeClasses[size]}
    `}>
      {showIcon && config.icon}
      {config.label}
    </span>
  );
};