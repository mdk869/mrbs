'use client';

import React from 'react';
import { Calendar, LogOut, Shield, User } from 'lucide-react';
import { ThemeToggle } from './ui/ThemeToggle';
import { MobileMenu } from './ui/MobileMenu';
import { useResponsive } from '@/hooks/useResponsive';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  showLogout?: boolean;
  onLogout?: () => void;
  userRole?: 'user' | 'admin' | 'super_admin' | null;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  title,
  showLogout = false,
  onLogout,
  userRole
}) => {
  const { isMobile } = useResponsive();

  const getRoleIcon = () => {
    switch (userRole) {
      case 'super_admin':
        return <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 dark:text-red-400" />;
      case 'admin':
        return <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />;
      case 'user':
        return <User className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />;
      default:
        return null;
    }
  };

  const getRoleLabel = () => {
    switch (userRole) {
      case 'super_admin':
        return 'Super Admin';
      case 'admin':
        return 'Admin';
      case 'user':
        return 'User';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      <header className="bg-surface-elevated shadow-sm border-b border-default sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center min-w-0 flex-1">
              <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-primary-600 dark:text-primary-400 mr-2 sm:mr-3 flex-shrink-0" />
              <h1 className="text-lg sm:text-xl font-semibold text-emphasis truncate">{title}</h1>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              {!isMobile && (
                <>
                  {userRole && (
                    <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 dark:bg-dark-700 rounded-full">
                      {getRoleIcon()}
                      <span className="text-sm font-medium text-emphasis hidden sm:inline">
                        {getRoleLabel()}
                      </span>
                    </div>
                  )}
                  
                  <ThemeToggle />
                  
                  {showLogout && onLogout && (
                    <button
                      onClick={onLogout}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-muted hover:text-emphasis hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
                    >
                      <LogOut className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Logout</span>
                    </button>
                  )}
                </>
              )}
              
              {isMobile && (
                <MobileMenu userRole={userRole} onLogout={onLogout} />
              )}
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};