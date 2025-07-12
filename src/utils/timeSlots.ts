import { Reservation } from '../types';
import { storageUtils } from './storage';

export const generateTimeSlots = (): string[] => {
  const slots: string[] = [];
  for (let hour = 8; hour <= 18; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    if (hour < 18) {
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }
  return slots;
};

export const isTimeSlotAvailable = (date: string, startTime: string, endTime: string, roomName: string): boolean => {
  const reservations = storageUtils.getReservations();
  
  return !reservations.some(reservation => {
    if (reservation.date !== date || reservation.roomName !== roomName || reservation.status === 'cancelled') {
      return false;
    }

    const resStart = reservation.startTime;
    const resEnd = reservation.endTime;
    
    // Check for time overlap
    return (startTime < resEnd && endTime > resStart);
  });
};

export const getAvailableEndTimes = (date: string, startTime: string, roomName: string): string[] => {
  const allSlots = generateTimeSlots();
  const startIndex = allSlots.indexOf(startTime);
  
  if (startIndex === -1) return [];
  
  const availableEndTimes: string[] = [];
  
  for (let i = startIndex + 1; i < allSlots.length; i++) {
    const endTime = allSlots[i];
    if (isTimeSlotAvailable(date, startTime, endTime, roomName)) {
      availableEndTimes.push(endTime);
    } else {
      break; // Stop at first conflict
    }
  }
  
  return availableEndTimes;
};