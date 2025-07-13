import React from 'react';
import { Calendar, LogOut, Shield, User } from 'lucide-react';

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
  const getRoleIcon = () => {
    switch (userRole) {
      case 'super_admin':
        return <Shield className="h-5 w-5 text-red-600" />;
      case 'admin':
        return <Shield className="h-5 w-5 text-blue-600" />;
      case 'user':
        return <User className="h-5 w-5 text-green-600" />;
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-primary-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {userRole && (
                <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full">
                  {getRoleIcon()}
                  <span className="text-sm font-medium text-gray-700">
                    {getRoleLabel()}
                  </span>
                </div>
              )}
              
              {showLogout && onLogout && (
                <button
                  onClick={onLogout}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {children}
        </div>
      </main>
    </div>
  );
};