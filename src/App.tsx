import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Login } from './components/Login';
import { UserDashboard } from './components/UserDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { SuperAdminDashboard } from './components/SuperAdminDashboard';
import { UserReservation } from './components/UserReservation';
import { User, AdminUser, AuthState } from './types';

type ViewMode = 'login' | 'user-dashboard' | 'user-reservation' | 'admin-dashboard' | 'super-admin-dashboard';

function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('login');
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    userRole: null
  });

  const handleLogin = (user: User | AdminUser, role: 'user' | 'admin' | 'super_admin') => {
    setAuthState({
      isAuthenticated: true,
      user,
      userRole: role
    });

    // Navigate based on role
    switch (role) {
      case 'user':
        setCurrentView('user-dashboard');
        break;
      case 'admin':
        setCurrentView('admin-dashboard');
        break;
      case 'super_admin':
        setCurrentView('super-admin-dashboard');
        break;
    }
  };

  const handleLogout = () => {
    setAuthState({
      isAuthenticated: false,
      user: null,
      userRole: null
    });
    setCurrentView('login');
  };

  const handleCreateReservation = () => {
    setCurrentView('user-reservation');
  };

  const handleReservationComplete = () => {
    setCurrentView('user-dashboard');
  };

  const getLayoutTitle = () => {
    switch (currentView) {
      case 'user-dashboard':
        return 'eBilik Booking';
      case 'user-reservation':
        return 'Create New Booking';
      case 'admin-dashboard':
        return 'eBilik Management - Admin';
      case 'super-admin-dashboard':
        return 'eBilik Management - Super Admin';
      default:
        return 'eBilik System';
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'login':
        return <Login onLogin={handleLogin} />;
      
      case 'user-dashboard':
        return (
          <Layout
            title={getLayoutTitle()}
            showLogout={true}
            onLogout={handleLogout}
            userRole={authState.userRole}
          >
            <UserDashboard 
              user={authState.user as User} 
              onCreateReservation={handleCreateReservation}
            />
          </Layout>
        );
      
      case 'user-reservation':
        return (
          <Layout
            title={getLayoutTitle()}
            showLogout={true}
            onLogout={handleLogout}
            userRole={authState.userRole}
          >
            <UserReservation 
              user={authState.user as User}
              onReservationComplete={handleReservationComplete}
            />
          </Layout>
        );
      
      case 'admin-dashboard':
        return (
          <Layout
            title={getLayoutTitle()}
            showLogout={true}
            onLogout={handleLogout}
            userRole={authState.userRole}
          >
            <AdminDashboard />
          </Layout>
        );
      
      case 'super-admin-dashboard':
        return (
          <Layout
            title={getLayoutTitle()}
            showLogout={true}
            onLogout={handleLogout}
            userRole={authState.userRole}
          >
            <SuperAdminDashboard />
          </Layout>
        );
      
      default:
        return <Login onLogin={handleLogin} />;
    }
  };

  return renderContent();
}

export default App;