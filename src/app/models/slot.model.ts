export interface TimeSlot {
  id: string;
  day: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: 'available' | 'booked';
  bookedBy?: string;
  isBreak?: boolean;
}

export interface SlotSummary {
  totalSlots: number;
  bookedSlots: number;
  availableSlots: number;
}