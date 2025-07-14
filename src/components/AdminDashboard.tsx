import React, { useState, useEffect } from 'react';
import { Search, Calendar, Clock, User, Mail, MapPin, SchoolIcon, Trash2 } from 'lucide-react';
import { supabaseUtils } from '@/utils/supabaseUtils';
import { Reservation } from '@/types';
import { format, parseISO } from 'date-fns';
import { StatusBadge } from './ui/StatusBadge';
import { StatsCard } from './ui/StatsCard';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { useResponsive } from '@/hooks/useResponsive';

export const AdminDashboard: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'created'>('date');
  const [isLoading, setIsLoading] = useState(true);
  const { isMobile } = useResponsive();

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    setIsLoading(true);
    try {
      const allReservations = await supabaseUtils.getReservations();
      setReservations(allReservations);
    } catch (error) {
      console.error('Error loading reservations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: Reservation['status']) => {
    await supabaseUtils.updateReservation(id, { status: newStatus });
    loadReservations();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this reservation?')) {
      await supabaseUtils.deleteReservation(id);
      loadReservations();
    }
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
    .sort((a, b) => {
      if (sortBy === 'date') {
        const dateComparison = a.date.localeCompare(b.date);
        if (dateComparison === 0) {
          return a.startTime.localeCompare(b.startTime);
        }
        return dateComparison;
      } else {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const stats = [
    {
      title: 'Total',
      value: reservations.length,
      icon: Calendar,
      iconColor: 'text-gray-600 dark:text-gray-400'
    },
    {
      title: 'Confirmed',
      value: reservations.filter(r => r.status === 'confirmed').length,
      icon: Calendar,
      iconColor: 'text-secondary-600 dark:text-secondary-400'
    },
    {
      title: 'Pending',
      value: reservations.filter(r => r.status === 'pending').length,
      icon: Clock,
      iconColor: 'text-accent-600 dark:text-accent-400'
    },
    {
      title: 'Cancelled',
      value: reservations.filter(r => r.status === 'cancelled').length,
      icon: MapPin,
      iconColor: 'text-red-600 dark:text-red-400'
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            iconColor={stat.iconColor}
          />
        ))}
      </div>

      {/* Filters */}
      <div className="card p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 sm:h-5 sm:w-5 text-muted" />
              </div>
              <input
                type="text"
                className="input-field pl-8 sm:pl-10"
                placeholder="Search reservations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-none lg:flex lg:space-x-4">
            <select
              className="input-field"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
            
            <select
              className="input-field"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'created')}
            >
              <option value="date">Sort by Date</option>
              <option value="created">Sort by Created</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reservations List */}
      <div className="card overflow-hidden">
        <div className="divide-y divide-gray-200 dark:divide-dark-700">
          {filteredReservations.length === 0 ? (
            <div className="px-4 sm:px-6 py-8 text-center text-muted">
              No reservations found matching your criteria.
            </div>
          ) : (
            filteredReservations.map((reservation) => (
              <div key={reservation.id} className="p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-2 sm:space-y-0">
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-1 sm:space-y-0">
                          <p className="text-sm font-medium text-emphasis truncate">
                            {reservation.userName}
                          </p>
                          <StatusBadge status={reservation.status} size="sm" />
                        </div>
                        
                        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs sm:text-sm text-muted">
                          <div className="flex items-center">
                            <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                            <span className="truncate">{reservation.email}</span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                            <span className="truncate">{reservation.roomName}</span>
                          </div>
                          <div className="flex items-center">
                            <SchoolIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                            <span className="truncate">{reservation.tingkatan} {reservation.kelas}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                            <span className="truncate">{format(parseISO(reservation.date), 'MMM dd, yyyy')}</span>
                          </div>
                          <div className="flex items-center sm:col-span-2 lg:col-span-1">
                            <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                            <span className="truncate">{reservation.startTime} - {reservation.endTime}</span>
                          </div>
                        </div>
                        
                        <p className="mt-2 text-xs sm:text-sm text-muted truncate">
                          {reservation.purpose}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                    <select
                      value={reservation.status}
                      onChange={(e) => handleStatusChange(reservation.id, e.target.value as Reservation['status'])}
                      className="text-xs sm:text-sm border border-gray-300 dark:border-dark-600 rounded-md px-2 py-1 bg-white dark:bg-dark-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    
                    <button
                      onClick={() => handleDelete(reservation.id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors self-center"
                      title="Delete reservation"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};