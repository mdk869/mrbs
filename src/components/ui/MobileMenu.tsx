'use client';

import React, { useState } from 'react';
import { Menu, X, LogOut, Shield, User } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface MobileMenuProps {
  userRole?: 'user' | 'admin' | 'super_admin' | null;
  onLogout?: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ userRole, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);

  const getRoleIcon = () => {
    switch (userRole) {
      case 'super_admin':
        return <Shield className="h-4 w-4 text-red-600 dark:text-red-400" />;
      case 'admin':
        return <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      case 'user':
        return <User className="h-4 w-4 text-green-600 dark:text-green-400" />;
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
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-dark-800 transition-colors"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-dark-800 rounded-lg shadow-lg border border-gray-200 dark:border-dark-700 z-50">
            <div className="p-4 space-y-4">
              {userRole && (
                <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-dark-700 rounded-md">
                  {getRoleIcon()}
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {getRoleLabel()}
                  </span>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</span>
                <ThemeToggle />
              </div>
              
              {onLogout && (
                <button
                  onClick={() => {
                    onLogout();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};