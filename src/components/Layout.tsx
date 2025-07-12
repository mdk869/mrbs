import React from 'react';
import { Calendar, Users, LogOut, Home } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  showLogout?: boolean;
  onLogout?: () => void;
  showNavigation?: boolean;
  currentView?: 'user' | 'admin';
  onNavigate?: (view: 'user' | 'admin') => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  title,
  showLogout = false,
  onLogout,
  showNavigation = false,
  currentView,
  onNavigate
}) => {
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
              {showNavigation && onNavigate && (
                <nav className="flex space-x-1">
                  <button
                    onClick={() => onNavigate('user')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      currentView === 'user'
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Home className="h-4 w-4 inline mr-1" />
                    Book Room
                  </button>
                  <button
                    onClick={() => onNavigate('admin')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      currentView === 'admin'
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Users className="h-4 w-4 inline mr-1" />
                    Admin
                  </button>
                </nav>
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