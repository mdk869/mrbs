'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  iconColor = 'text-gray-400 dark:text-gray-500',
  trend
}) => {
  return (
    <div className="card p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gray-100 dark:bg-dark-700 rounded-lg">
            <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${iconColor}`} />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-medium text-muted">{title}</p>
            <p className="text-lg sm:text-2xl font-bold text-emphasis">{value}</p>
          </div>
        </div>
        
        {trend && (
          <div className={`text-xs sm:text-sm font-medium ${
            trend.isPositive 
              ? 'text-secondary-600 dark:text-secondary-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            {trend.isPositive ? '+' : ''}{trend.value}%
          </div>
        )}
      </div>
    </div>
  );
};