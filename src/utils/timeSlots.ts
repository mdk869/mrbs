import { Reservation } from '../types';
import { supabaseUtils } from './supabaseUtils';

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

export const isTimeSlotAvailable = async (
  date: string,
  startTime: string,
  endTime: string,
  roomName: string
): Promise<boolean> => {
  const reservations = await supabaseUtils.getReservations();

  return !reservations.some((reservation: Reservation) => {
    if (reservation.date !== date || reservation.roomName !== roomName || reservation.status === 'cancelled') {
      return false;
    }

    const resStart = reservation.startTime;
    const resEnd = reservation.endTime;

    return startTime < resEnd && endTime > resStart;
  });
};

export const getAvailableEndTimes = async (
  date: string,
  startTime: string,
  roomName: string
): Promise<string[]> => {
  const allSlots = generateTimeSlots();
  const startIndex = allSlots.indexOf(startTime);

  if (startIndex === -1) return [];

  const availableEndTimes: string[] = [];

  for (let i = startIndex + 1; i < allSlots.length; i++) {
    const endTime = allSlots[i];
    const available = await isTimeSlotAvailable(date, startTime, endTime, roomName);
    if (available) {
      availableEndTimes.push(endTime);
    } else {
      break;
    }
  }

  return availableEndTimes;
};
