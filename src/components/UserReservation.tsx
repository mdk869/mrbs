import React, { useState } from 'react';
import { Calendar, Clock, User, Mail, MapPin, FileText, Check, ListOrdered, PresentationIcon, ArrowLeft } from 'lucide-react';
import { supabaseUtils } from '@/utils/supabaseUtils';
import { generateTimeSlots, getAvailableEndTimes } from '@/utils/timeSlots';
import { format, addDays, startOfToday } from 'date-fns';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { useResponsive } from '@/hooks/useResponsive';

const MEETING_ROOMS = [
  'Makmal Komputer 1',
  'Makmal Komputer 2',
  'Makmal Komputer 3',
  'Bilik Tayangan',
  'Bilik Audio/Visual'
];

const Tingkatan = ['1', '2', '3', '4', '5'];
const Kelas = [
  'Ibnu Sina',
  'Ibnu Rusyd',
  'Ibnu Khaldun',
  'Ibnu Zuhri',
  'Al-Khawarizmi',
  'Al-Farabi',
  'Al-Biruni',
  'Al-Haitham'
];

interface UserReservationProps {
  user: any;
  onReservationComplete: () => void;
  onReturnHome: () => void;
}

export const UserReservation: React.FC<UserReservationProps> = ({ user, onReservationComplete, onReturnHome }) => {
  const [formData, setFormData] = useState({
    userName: user.fullName,
    email: user.email,
    date: '',
    startTime: '',
    endTime: '',
    roomName: '',
    purpose: '',
    tingkatan: '',
    kelas: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [availableEndTimes, setAvailableEndTimes] = useState<string[]>([]);
  const { isMobile } = useResponsive();

  const timeSlots = generateTimeSlots();
  const today = startOfToday();
  const maxDate = format(addDays(today, 30), 'yyyy-MM-dd');
  const minDate = format(today, 'yyyy-MM-dd');

  const handleStartTimeChange = async (startTime: string) => {
    setFormData(prev => ({ ...prev, startTime, endTime: '' }));
    
    if (formData.date && formData.roomName && startTime) {
      const endTimes = await getAvailableEndTimes(formData.date, startTime, formData.roomName);
      setAvailableEndTimes(endTimes);
    } else {
      setAvailableEndTimes([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      await supabaseUtils.addReservation({
        ...formData,
        userId: user.id,
        status: 'confirmed'
      });

      setSubmitted(true);
      onReservationComplete();
      setFormData({
        userName: user.fullName,
        email: user.email,
        date: '',
        startTime: '',
        endTime: '',
        roomName: '',
        purpose: '',
        tingkatan: '',
        kelas: ''
      });
    } catch (error) {
      console.error('Error submitting reservation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto card p-6 sm:p-8 text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-secondary-100 dark:bg-secondary-900/30 mb-4">
          <Check className="h-6 w-6 text-secondary-600 dark:text-secondary-400" />
        </div>
        <h3 className="text-lg font-medium text-emphasis mb-2">Reservation Confirmed!</h3>
        <p className="text-muted mb-6 text-sm sm:text-base">
          Your eBilik room has been successfully booked. You will receive a confirmation email shortly.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="btn-primary w-full"
        >
          Book Another Room
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto card p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
        <h2 className="text-xl sm:text-2xl font-bold text-emphasis">Book a eBilik Room</h2>
        <button
          onClick={onReturnHome}
          className="btn-ghost flex items-center justify-center sm:justify-start space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Home</span>
        </button>
      </div>

      <div className="text-center mb-6 sm:mb-8">
        <p className="text-muted text-sm sm:text-base">Reserve your preferred meeting space with ease</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-emphasis mb-2">
              <User className="h-4 w-4 inline mr-1" />
              Full Name
            </label>
            <input
              type="text"
              required
              className="input-field bg-gray-50 dark:bg-dark-700"
              placeholder="Enter your full name"
              value={formData.userName}
              readOnly
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-emphasis mb-2">
              <Mail className="h-4 w-4 inline mr-1" />
              Email Address
            </label>
            <input
              type="email"
              required
              className="input-field bg-gray-50 dark:bg-dark-700"
              placeholder="Enter your email"
              value={formData.email}
              readOnly
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-emphasis mb-2">
              <Calendar className="h-4 w-4 inline mr-1" />
              Date
            </label>
            <input
              type="date"
              required
              min={minDate}
              max={maxDate}
              className="input-field"
              value={formData.date}
              onChange={(e) => {
                setFormData({ ...formData, date: e.target.value, startTime: '', endTime: '' });
                setAvailableEndTimes([]);
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-emphasis mb-2">
              <MapPin className="h-4 w-4 inline mr-1" />
              eBilik Room
            </label>
            <select
              required
              className="input-field"
              value={formData.roomName}
              onChange={(e) => {
                setFormData({ ...formData, roomName: e.target.value, startTime: '', endTime: '' });
                setAvailableEndTimes([]);
              }}
            >
              <option value="">Select a room</option>
              {MEETING_ROOMS.map((room) => (
                <option key={room} value={room}>{room}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-emphasis mb-2">
              <ListOrdered className="h-4 w-4 inline mr-1" />
              Tingkatan
            </label>
            <select
              required
              className="input-field"
              value={formData.tingkatan}
              onChange={(e) => setFormData({ ...formData, tingkatan: e.target.value })}
            >
              <option value="">Select Tingkatan</option>
              {Tingkatan.map((ting) => (
                <option key={ting} value={ting}>{ting}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-emphasis mb-2">
              <PresentationIcon className="h-4 w-4 inline mr-1" />
              Kelas
            </label>
            <select
              required
              className="input-field"
              value={formData.kelas}
              onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
            >
              <option value="">Select Kelas</option>
              {Kelas.map((kelas) => (
                <option key={kelas} value={kelas}>{kelas}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-emphasis mb-2">
              <Clock className="h-4 w-4 inline mr-1" />
              Start Time
            </label>
            <select
              required
              className="input-field"
              value={formData.startTime}
              onChange={(e) => handleStartTimeChange(e.target.value)}
            >
              <option value="">Select start time</option>
              {timeSlots.slice(0, -1).map((time) => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-emphasis mb-2">
              <Clock className="h-4 w-4 inline mr-1" />
              End Time
            </label>
            <select
              required
              className="input-field"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              disabled={!formData.startTime || availableEndTimes.length === 0}
            >
              <option value="">Select end time</option>
              {Array.isArray(availableEndTimes) &&
                availableEndTimes.map((time) => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-emphasis mb-2">
            <FileText className="h-4 w-4 inline mr-1" />
            Meeting Purpose
          </label>
          <textarea
            required
            rows={3}
            className="input-field"
            placeholder="Brief description of the meeting purpose"
            value={formData.purpose}
            onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full flex items-center justify-center space-x-2"
        >
          {isSubmitting && <LoadingSpinner size="sm" />}
          <span>{isSubmitting ? 'Booking...' : 'Book eBilik Room'}</span>
        </button>
      </form>
    </div>
  );
};