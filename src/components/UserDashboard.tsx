import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Plus, History, User as UserIcon } from 'lucide-react';
import { storageUtils } from '../utils/storage';
import { Reservation, User } from '../types';
import { format, parseISO, isSameDay } from 'date-fns';
import ReactCalendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

interface UserDashboardProps {
  user: User;
  onCreateReservation: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ user, onCreateReservation }) => {
  const [userReservations, setUserReservations] = useState<Reservation[]>([]);
  const [allReservations, setAllReservations] = useState<Reservation[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<'calendar' | 'history'>('calendar');

  useEffect(() => {
    loadReservations();
  }, [user.id]);

  const loadReservations = () => {
    const userRes = storageUtils.getUserReservations(user.id);
    const allRes = storageUtils.getReservations();
    setUserReservations(userRes);
    setAllReservations(allRes);
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
        return 'bg-primary-100 text-primary-800 font-semibold';
      } else if (reservationsForDate.length > 0) {
        return 'bg-gray-100 text-gray-600';
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
            <div className={`w-2 h-2 rounded-full ${
              userReservationsForDate.length > 0 ? 'bg-primary-600' : 'bg-gray-400'
            }`} />
          </div>
        );
      }
    }
    return null;
  };

  const selectedDateReservations = getReservationsForDate(selectedDate);
  const userSelectedDateReservations = getUserReservationsForDate(selectedDate);

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

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome back, {user.fullName}!</h1>
            <p className="text-primary-100">
              <UserIcon className="h-4 w-4 inline mr-1" />
              {user.userType.charAt(0).toUpperCase() + user.userType.slice(1)} • {user.email}
            </p>
          </div>
          <button
            onClick={onCreateReservation}
            className="bg-white text-primary-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Booking
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Calendar className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{userReservations.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-secondary-100 rounded-lg">
              <Clock className="h-6 w-6 text-secondary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Confirmed</p>
              <p className="text-2xl font-bold text-gray-900">
                {userReservations.filter(r => r.status === 'confirmed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-accent-100 rounded-lg">
              <MapPin className="h-6 w-6 text-accent-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {userReservations.filter(r => r.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('calendar')}
              className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'calendar'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Calendar className="h-4 w-4 inline mr-2" />
              Calendar View
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'history'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <History className="h-4 w-4 inline mr-2" />
              Booking History
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'calendar' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Calendar */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Booking Calendar</h3>
                <div className="calendar-container">
                  <ReactCalendar
                    onChange={(value) => setSelectedDate(value as Date)}
                    value={selectedDate}
                    tileClassName={tileClassName}
                    tileContent={tileContent}
                    className="w-full border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="mt-4 flex items-center space-x-4 text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-primary-600 rounded-full mr-2"></div>
                    <span>Your bookings</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
                    <span>Other bookings</span>
                  </div>
                </div>
              </div>

              {/* Selected Date Details */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {format(selectedDate, 'MMMM dd, yyyy')}
                </h3>
                
                {selectedDateReservations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No bookings for this date</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedDateReservations.map((reservation) => (
                      <div
                        key={reservation.id}
                        className={`p-4 rounded-lg border-2 ${
                          reservation.userId === user.id
                            ? 'border-primary-200 bg-primary-50'
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{reservation.roomName}</h4>
                          <span className={getStatusBadge(reservation.status)}>
                            {reservation.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {reservation.startTime} - {reservation.endTime}
                          </div>
                          <div className="flex items-center">
                            <UserIcon className="h-4 w-4 mr-1" />
                            {reservation.userId === user.id ? 'Your booking' : reservation.userName}
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
              <h3 className="text-lg font-medium text-gray-900 mb-4">Your Booking History</h3>
              {userReservations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <History className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No bookings yet</p>
                  <button
                    onClick={onCreateReservation}
                    className="mt-4 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Make your first booking
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {userReservations
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((reservation) => (
                      <div key={reservation.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{reservation.roomName}</h4>
                          <span className={getStatusBadge(reservation.status)}>
                            {reservation.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {format(parseISO(reservation.date), 'MMM dd, yyyy')}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {reservation.startTime} - {reservation.endTime}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {reservation.purpose}
                          </div>
                        </div>
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