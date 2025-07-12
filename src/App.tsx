import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { AdminLogin } from './components/AdminLogin';
import { UserLogin } from './components/UserLogin';
import { UserDashboard } from './components/UserDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { UserReservation } from './components/UserReservation';
import { User, AuthState } from './types';

type ViewMode = 'user-login' | 'user-dashboard' | 'user-reservation' | 'admin-login' | 'admin-dashboard';

function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('user-login');
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isAdmin: false
  });

  const handleUserLogin = (user: User) => {
    setAuthState({
      isAuthenticated: true,
      user,
      isAdmin: false
    });
    setCurrentView('user-dashboard');
  };

  const handleAdminLogin = () => {
    setAuthState({
      isAuthenticated: true,
      user: null,
      isAdmin: true
    });
    setCurrentView('admin-dashboard');
  };

  const handleLogout = () => {
    setAuthState({
      isAuthenticated: false,
      user: null,
      isAdmin: false
    });
    setCurrentView('user-login');
  };

  const handleNavigation = (view: 'user' | 'admin') => {
    if (view === 'user') {
      if (authState.isAuthenticated && !authState.isAdmin) {
        setCurrentView('user-dashboard');
      } else {
        setCurrentView('user-login');
      }
    } else {
      setCurrentView('admin-login');
    }
  };

  const handleCreateReservation = () => {
    setCurrentView('user-reservation');
  };

  const handleReservationComplete = () => {
    setCurrentView('user-dashboard');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'user-login':
        return <UserLogin onLogin={handleUserLogin} />;
      
      case 'user-dashboard':
        return (
          <Layout
            title="Meeting Room Booking"
            showLogout={true}
            onLogout={handleLogout}
            showNavigation={true}
            currentView="user"
            onNavigate={handleNavigation}
          >
            <UserDashboard 
              user={authState.user!} 
              onCreateReservation={handleCreateReservation}
            />
          </Layout>
        );
      
      case 'user-reservation':
        return (
          <Layout
            title="Create New Booking"
            showLogout={true}
            onLogout={handleLogout}
            showNavigation={true}
            currentView="user"
            onNavigate={handleNavigation}
          >
            <UserReservation 
              user={authState.user!}
              onReservationComplete={handleReservationComplete}
            />
          </Layout>
        );
      
      case 'admin-login':
        return <AdminLogin onLogin={handleAdminLogin} />;
      
      case 'admin-dashboard':
        return (
          <Layout
            title="Meeting Room Management"
            showLogout={true}
            onLogout={handleLogout}
            showNavigation={true}
            currentView="admin"
            onNavigate={handleNavigation}
          >
            <AdminDashboard />
          </Layout>
        );
      
      default:
        return <UserLogin onLogin={handleUserLogin} />;
    }
  };

  return renderContent();
}

export default App;