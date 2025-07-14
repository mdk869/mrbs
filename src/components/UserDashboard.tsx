'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Plus, History, User as UserIcon, SchoolIcon, Edit, Trash2 } from 'lucide-react';
import { supabaseUtils } from '@/utils/supabaseUtils';
import { Reservation, User } from '@/types';
import { format, parseISO } from 'date-fns';
import dynamic from 'next/dynamic';
import { StatusBadge } from './ui/StatusBadge';
import { StatsCard } from './ui/StatsCard';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { useResponsive } from '@/hooks/useResponsive';
import 'react-calendar/dist/Calendar.css';

const ReactCalendar = dynamic(() => import('react-calendar'), { ssr: false });

interface UserDashboardProps {
  user: User;
  onCreateReservation: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ user, onCreateReservation }) => {
  const [userReservations, setUserReservations] = useState<Reservation[]>([]);
  const [allReservations, setAllReservations] = useState<Reservation[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<'calendar' | 'history'>('calendar');
  const [editingReservation, setEditingReservation] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Reservation>>({});
  const [isLoading, setIsLoading] = useState(true);
  const { isMobile, isTablet } = useResponsive();

  useEffect(() => {
    loadReservations();
  }, [user.id]);

  const loadReservations = async () => {
    setIsLoading(true);
    try {
      const userRes = await supabaseUtils.getUserReservations(user.id);
      const allRes = await supabaseUtils.getReservations();
      setUserReservations(userRes);
      setAllReservations(allRes);
    } catch (error) {
      console.error('Error loading reservations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditReservation = (reservation: Reservation) => {
    setEditingReservation(reservation.id);
    setEditFormData({
      date: reservation.date,
      startTime: reservation.startTime,
      endTime: reservation.endTime,
      roomName: reservation.roomName,
      purpose: reservation.purpose,
      tingkatan: reservation.tingkatan,
      kelas: reservation.kelas
    });
  };

  const handleSaveEdit = async () => {
    if (editingReservation) {
      await supabaseUtils.updateReservation(editingReservation, editFormData);
      setEditingReservation(null);
      setEditFormData({});
      loadReservations();
    }
  };

  const handleCancelEdit = () => {
    setEditingReservation(null);
    setEditFormData({});
  };

  const handleDeleteReservation = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this reservation?')) {
      await supabaseUtils.deleteReservation(id);
      loadReservations();
    }
  };

  const getReservationsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return allReservations.filter(res => res.date === dateStr && res.status !== 'cancelled');
  };

  const getUserReservationsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return userReservations.filter(res => res.date === dateStr && res.status !== 'cancelled');
  };

  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const reservationsForDate = getReservationsForDate(date);
      const userReservationsForDate = getUserReservationsForDate(date);
      
      if (userReservationsForDate.length > 0) {
        return 'bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 font-semibold';
      } else if (reservationsForDate.length > 0) {
        return 'bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-400';
      }
    }
    return '';
  };

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const reservationsForDate = getReservationsForDate(date);
      const userReservationsForDate = getUserReservationsForDate(date);
      
      if (reservationsForDate.length > 0) {
        return (
          <div className="flex justify-center mt-1">
            <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
              userReservationsForDate.length > 0 
                ? 'bg-primary-600 dark:bg-primary-400' 
                : 'bg-gray-400 dark:bg-gray-500'
            }`} />
          </div>
        );
      }
    }
    return null;
  };

  const selectedDateReservations = getReservationsForDate(selectedDate);
  const userSelectedDateReservations = getUserReservationsForDate(selectedDate);

  const stats = [
    {
      title: 'Total Bookings',
      value: userReservations.length,
      icon: Calendar,
      iconColor: 'text-primary-600 dark:text-primary-400'
    },
    {
      title: 'Confirmed',
      value: userReservations.filter(r => r.status === 'confirmed').length,
      icon: Clock,
      iconColor: 'text-secondary-600 dark:text-secondary-400'
    },
    {
      title: 'Pending',
      value: userReservations.filter(r => r.status === 'pending').length,
      icon: MapPin,
      iconColor: 'text-accent-600 dark:text-accent-400'
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
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 dark:from-primary-700 dark:to-secondary-700 rounded-xl p-4 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold mb-2">Welcome, {user.fullName}!</h1>
            <p className="text-primary-100 dark:text-primary-200 text-sm sm:text-base">
              <UserIcon className="h-4 w-4 inline mr-1" />
              {user.userType.charAt(0).toUpperCase() + user.userType.slice(1)} • {user.email}
            </p>
          </div>
          <button
            onClick={onCreateReservation}
            className="bg-white text-primary-600 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2 w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>New Booking</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

      {/* Tabs */}
      <div className="card">
        <div className="border-b border-default">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('calendar')}
              className={`py-3 sm:py-4 px-4 sm:px-6 border-b-2 font-medium text-sm transition-colors flex-1 sm:flex-none ${
                activeTab === 'calendar'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-muted hover:text-emphasis hover:border-gray-300 dark:hover:border-dark-600'
              }`}
            >
              <Calendar className="h-4 w-4 inline mr-2" />
              Calendar
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-3 sm:py-4 px-4 sm:px-6 border-b-2 font-medium text-sm transition-colors flex-1 sm:flex-none ${
                activeTab === 'history'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-muted hover:text-emphasis hover:border-gray-300 dark:hover:border-dark-600'
              }`}
            >
              <History className="h-4 w-4 inline mr-2" />
              History
            </button>
          </nav>
        </div>

        <div className="p-4 sm:p-6">
          {activeTab === 'calendar' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Calendar */}
              <div>
                <h3 className="text-lg font-medium text-emphasis mb-4">Booking Calendar</h3>
                <div className="calendar-container">
                  <ReactCalendar
                    onChange={(value) => setSelectedDate(value as Date)}
                    value={selectedDate}
                    tileClassName={tileClassName}
                    tileContent={tileContent}
                    className="w-full border border-gray-300 dark:border-dark-600 rounded-lg"
                  />
                </div>
                <div className="mt-4 flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-primary-600 dark:bg-primary-400 rounded-full mr-2"></div>
                    <span className="text-muted">Your bookings</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-gray-400 dark:bg-gray-500 rounded-full mr-2"></div>
                    <span className="text-muted">Other bookings</span>
                  </div>
                </div>
              </div>

              {/* Selected Date Details */}
              <div>
                <h3 className="text-lg font-medium text-emphasis mb-4">
                  {format(selectedDate, 'MMMM dd, yyyy')}
                </h3>
                
                {selectedDateReservations.length === 0 ? (
                  <div className="text-center py-8 text-muted">
                    <Calendar className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <p className="text-sm sm:text-base">No bookings for this date</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedDateReservations.map((reservation) => (
                      <div
                        key={reservation.id}
                        className={`p-3 sm:p-4 rounded-lg border-2 transition-colors ${
                          reservation.userId === user.id
                            ? 'border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-gray-200 dark:border-dark-600 bg-gray-50 dark:bg-dark-700/50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-emphasis text-sm sm:text-base">{reservation.roomName}</h4>
                          <StatusBadge status={reservation.status} size="sm" />
                        </div>
                        <div className="text-xs sm:text-sm text-muted space-y-1">
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            {reservation.startTime} - {reservation.endTime}
                          </div>
                          <div className="flex items-center">
                            <UserIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            {reservation.userId === user.id ? 'Your booking' : reservation.userName}
                          </div>
                          <div className="flex items-center">
                            <SchoolIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            {reservation.tingkatan} {reservation.kelas}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* History Tab */
            <div>
              <h3 className="text-lg font-medium text-emphasis mb-4">Your Booking History</h3>
              {userReservations.length === 0 ? (
                <div className="text-center py-8 text-muted">
                  <History className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <p className="text-sm sm:text-base mb-4">No bookings yet</p>
                  <button
                    onClick={onCreateReservation}
                    className="btn-primary"
                  >
                    Make your first booking
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {userReservations
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((reservation) => (
                      <div key={reservation.id} className="card p-4">
                        {editingReservation === reservation.id ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-emphasis mb-1">Date</label>
                                <input
                                  type="date"
                                  className="input-field"
                                  value={editFormData.date}
                                  onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-emphasis mb-1">Room</label>
                                <select
                                  className="input-field"
                                  value={editFormData.roomName}
                                  onChange={(e) => setEditFormData({ ...editFormData, roomName: e.target.value })}
                                >
                                  <option value="Makmal Komputer 1">Makmal Komputer 1</option>
                                  <option value="Makmal Komputer 2">Makmal Komputer 2</option>
                                  <option value="Makmal Komputer 3">Makmal Komputer 3</option>
                                  <option value="Bilik Tayangan">Bilik Tayangan</option>
                                  <option value="Bilik Audio/Visual">Bilik Audio/Visual</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-emphasis mb-1">Start Time</label>
                                <input
                                  type="time"
                                  className="input-field"
                                  value={editFormData.startTime}
                                  onChange={(e) => setEditFormData({ ...editFormData, startTime: e.target.value })}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-emphasis mb-1">End Time</label>
                                <input
                                  type="time"
                                  className="input-field"
                                  value={editFormData.endTime}
                                  onChange={(e) => setEditFormData({ ...editFormData, endTime: e.target.value })}
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-emphasis mb-1">Purpose</label>
                              <textarea
                                className="input-field"
                                rows={2}
                                value={editFormData.purpose}
                                onChange={(e) => setEditFormData({ ...editFormData, purpose: e.target.value })}
                              />
                            </div>
                            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                              <button
                                onClick={handleCancelEdit}
                                className="btn-ghost"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleSaveEdit}
                                className="btn-primary"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 space-y-2 sm:space-y-0">
                              <h4 className="font-medium text-emphasis">{reservation.roomName}</h4>
                              <div className="flex items-center space-x-2">
                                <StatusBadge status={reservation.status} size="sm" />
                                {reservation.status === 'pending' && (
                                  <>
                                    <button
                                      onClick={() => handleEditReservation(reservation)}
                                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-1 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                      title="Edit reservation"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteReservation(reservation.id)}
                                      className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                      title="Delete reservation"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm text-muted">
                              <div className="flex items-center">
                                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                                <span className="truncate">{format(parseISO(reservation.date), 'MMM dd, yyyy')}</span>
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                                <span className="truncate">{reservation.startTime} - {reservation.endTime}</span>
                              </div>
                              <div className="flex items-center">
                                <SchoolIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                                <span className="truncate">{reservation.tingkatan} {reservation.kelas}</span>
                              </div>
                              <div className="flex items-center sm:col-span-1 lg:col-span-1">
                                <span className="truncate">{reservation.purpose}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};