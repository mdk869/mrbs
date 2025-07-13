import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Trash2, 
  SchoolIcon,
  Plus,
  Edit,
  Shield,
  Download,
  UserPlus,
  Search,
  Filter
} from 'lucide-react';
import { storageUtils } from '../utils/storage';
import { Reservation, AdminUser, User as UserType } from '../types';
import { format, parseISO } from 'date-fns';

export const SuperAdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'reservations' | 'admins' | 'users'>('reservations');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [newAdminData, setNewAdminData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'admin' as 'admin' | 'super_admin'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setReservations(storageUtils.getReservations());
    setAdminUsers(storageUtils.getAdminUsers());
    setUsers(storageUtils.getUsers());
  };

  const handleStatusChange = (id: string, newStatus: Reservation['status']) => {
    storageUtils.updateReservation(id, { status: newStatus });
    loadData();
  };

  const handleDeleteReservation = (id: string) => {
    if (window.confirm('Are you sure you want to delete this reservation?')) {
      storageUtils.deleteReservation(id);
      loadData();
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await storageUtils.addAdminUser(newAdminData);
      setNewAdminData({ email: '', password: '', fullName: '', role: 'admin' });
      setShowAddAdmin(false);
      loadData();
    } catch (error) {
      alert((error as Error).message);
    }
  };

  const handleToggleAdminStatus = (id: string, currentStatus: boolean) => {
    storageUtils.updateAdminUser(id, { isActive: !currentStatus });
    loadData();
  };

  const handleDeleteAdmin = (id: string) => {
    if (window.confirm('Are you sure you want to delete this admin user?')) {
      storageUtils.deleteAdminUser(id);
      loadData();
    }
  };

  const handleExportData = (format: 'json' | 'csv') => {
    const data = storageUtils.exportReservations(format);
    const blob = new Blob([data], { 
      type: format === 'csv' ? 'text/csv' : 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reservations_${format}_${format(new Date(), 'yyyy-MM-dd')}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredReservations = reservations
    .filter(reservation => {
      const matchesSearch = 
        reservation.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.roomName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.purpose.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || reservation.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const getStatusIcon = (status: Reservation['status']) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-secondary-500" />;
      case 'pending':
        return <AlertCircle className="h-5 w-5 text-accent-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusBadge = (status: Reservation['status']) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (status) {
      case 'confirmed':
        return `${baseClasses} bg-secondary-100 text-secondary-800`;
      case 'pending':
        return `${baseClasses} bg-accent-100 text-accent-800`;
      case 'cancelled':
        return `${baseClasses} bg-red-100 text-red-800`;
    }
  };

  const stats = {
    totalReservations: reservations.length,
    confirmedReservations: reservations.filter(r => r.status === 'confirmed').length,
    pendingReservations: reservations.filter(r => r.status === 'pending').length,
    totalAdmins: adminUsers.length,
    totalUsers: users.length,
  };

  return (
    <div className="space-y-6">
      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Reservations</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalReservations}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-secondary-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Confirmed</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.confirmedReservations}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-accent-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.pendingReservations}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Shield className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Admin Users</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalAdmins}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Regular Users</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalUsers}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('reservations')}
              className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'reservations'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Calendar className="h-4 w-4 inline mr-2" />
              Reservations
            </button>
            <button
              onClick={() => setActiveTab('admins')}
              className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'admins'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Shield className="h-4 w-4 inline mr-2" />
              Admin Users
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'users'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="h-4 w-4 inline mr-2" />
              Regular Users
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'reservations' && (
            <div className="space-y-6">
              {/* Filters and Export */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  <div className="flex-1">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Search reservations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <select
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">All Status</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="pending">Pending</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleExportData('csv')}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Export CSV
                  </button>
                  <button
                    onClick={() => handleExportData('json')}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Export JSON
                  </button>
                </div>
              </div>

              {/* Reservations List */}
              <div className="bg-gray-50 shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {filteredReservations.length === 0 ? (
                    <li className="px-6 py-8 text-center text-gray-500">
                      No reservations found matching your criteria.
                    </li>
                  ) : (
                    filteredReservations.map((reservation) => (
                      <li key={reservation.id} className="bg-white">
                        <div className="px-6 py-4 flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3">
                              {getStatusIcon(reservation.status)}
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {reservation.userName}
                                  </p>
                                  <span className={getStatusBadge(reservation.status)}>
                                    {reservation.status}
                                  </span>
                                </div>
                                <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                                  <div className="flex items-center">
                                    <Mail className="h-4 w-4 mr-1" />
                                    {reservation.email}
                                  </div>
                                  <div className="flex items-center">
                                    <MapPin className="h-4 w-4 mr-1" />
                                    {reservation.roomName}
                                  </div>
                                  <div className="flex items-center">
                                    <SchoolIcon className="h-4 w-4 mr-1" />
                                    {reservation.tingkatan} {reservation.kelas}
                                  </div>
                                  <div className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-1" />
                                    {format(parseISO(reservation.date), 'MMM dd, yyyy')}
                                  </div>
                                  <div className="flex items-center">
                                    <Clock className="h-4 w-4 mr-1" />
                                    {reservation.startTime} - {reservation.endTime}
                                  </div>
                                </div>
                                <p className="mt-1 text-sm text-gray-600 truncate">
                                  {reservation.purpose}
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <select
                              value={reservation.status}
                              onChange={(e) => handleStatusChange(reservation.id, e.target.value as Reservation['status'])}
                              className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                            
                            <button
                              onClick={() => handleDeleteReservation(reservation.id)}
                              className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50 transition-colors"
                              title="Delete reservation"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'admins' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Admin Users Management</h3>
                <button
                  onClick={() => setShowAddAdmin(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Admin
                </button>
              </div>

              {showAddAdmin && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <form onSubmit={handleAddAdmin} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input
                          type="text"
                          required
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                          value={newAdminData.fullName}
                          onChange={(e) => setNewAdminData({ ...newAdminData, fullName: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                          type="email"
                          required
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                          value={newAdminData.email}
                          onChange={(e) => setNewAdminData({ ...newAdminData, email: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                          type="password"
                          required
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                          value={newAdminData.password}
                          onChange={(e) => setNewAdminData({ ...newAdminData, password: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Role</label>
                        <select
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                          value={newAdminData.role}
                          onChange={(e) => setNewAdminData({ ...newAdminData, role: e.target.value as 'admin' | 'super_admin' })}
                        >
                          <option value="admin">Admin</option>
                          <option value="super_admin">Super Admin</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => setShowAddAdmin(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                      >
                        Add Admin
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {adminUsers.map((admin) => (
                    <li key={admin.id}>
                      <div className="px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-full ${admin.role === 'super_admin' ? 'bg-red-100' : 'bg-blue-100'}`}>
                            <Shield className={`h-5 w-5 ${admin.role === 'super_admin' ? 'text-red-600' : 'text-blue-600'}`} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{admin.fullName}</p>
                            <p className="text-sm text-gray-500">{admin.email}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                admin.role === 'super_admin' 
                                  ? 'bg-red-100 text-red-800' 
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                              </span>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                admin.isActive 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {admin.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleToggleAdminStatus(admin.id, admin.isActive)}
                            className={`px-3 py-1 rounded text-sm font-medium ${
                              admin.isActive
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {admin.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          {admin.role !== 'super_admin' && (
                            <button
                              onClick={() => handleDeleteAdmin(admin.id)}
                              className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Regular Users</h3>
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <li key={user.id}>
                      <div className="px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-green-100 rounded-full">
                            <User className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                              {user.userType.charAt(0).toUpperCase() + user.userType.slice(1)}
                            </span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          Joined: {format(parseISO(user.createdAt), 'MMM dd, yyyy')}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};