import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TimeSlot, SlotSummary } from '../models/slot.model';

@Injectable({
  providedIn: 'root'
})
export class SlotService {
  private slotsSubject = new BehaviorSubject<TimeSlot[]>([]);
  public slots$ = this.slotsSubject.asObservable();

  private days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  private timeSlots = [
    { start: '09:00', end: '09:20' },
    { start: '09:20', end: '09:40' },
    { start: '09:40', end: '10:00' },
    { start: '10:00', end: '10:20' },
    { start: '10:20', end: '10:40' },
    { start: '10:40', end: '11:00' },
    { start: '11:00', end: '11:20' },
    { start: '11:20', end: '11:40' },
    { start: '11:40', end: '12:00' },
    { start: '12:00', end: '12:20' },
    { start: '12:20', end: '12:40' },
    { start: '12:40', end: '01:00' },
    // Break
    { start: '02:00', end: '02:20', isBreak: true },
    { start: '02:20', end: '02:40', isBreak: true },
    { start: '02:40', end: '03:00', isBreak: true },
    { start: '03:00', end: '03:20', isBreak: true },
    { start: '03:20', end: '03:40', isBreak: true },
    { start: '03:40', end: '04:00', isBreak: true },
    { start: '04:00', end: '04:20', isBreak: true }
  ];

  constructor() {
    this.initializeSlots();
  }

  private initializeSlots(): void {
    const slots: TimeSlot[] = [];
    const currentDate = new Date();
    
    this.days.forEach((day, dayIndex) => {
      const date = new Date(currentDate);
      date.setDate(currentDate.getDate() + dayIndex);
      const dateStr = date.toISOString().split('T')[0];

      this.timeSlots.forEach((timeSlot, slotIndex) => {
        const slot: TimeSlot = {
          id: `${day}-${slotIndex}`,
          day,
          date: dateStr,
          startTime: timeSlot.start,
          endTime: timeSlot.end,
          duration: 20,
          status: Math.random() > 0.3 ? 'available' : 'booked',
          isBreak: timeSlot.isBreak || false
        };
        slots.push(slot);
      });
    });

    this.slotsSubject.next(slots);
  }

  getSlots(): Observable<TimeSlot[]> {
    return this.slots$;
  }

  bookSlot(slotId: string, userId: string): void {
    const slots = this.slotsSubject.value;
    const slotIndex = slots.findIndex(slot => slot.id === slotId);
    
    if (slotIndex !== -1) {
      slots[slotIndex] = {
        ...slots[slotIndex],
        status: 'booked',
        bookedBy: userId
      };
      this.slotsSubject.next([...slots]);
    }
  }

  getSlotSummary(): SlotSummary {
    const slots = this.slotsSubject.value;
    const regularSlots = slots.filter(slot => !slot.isBreak);
    
    return {
      totalSlots: regularSlots.length,
      bookedSlots: regularSlots.filter(slot => slot.status === 'booked').length,
      availableSlots: regularSlots.filter(slot => slot.status === 'available').length
    };
  }

  blockSelectedSlots(selectedSlotIds: string[]): void {
    const slots = this.slotsSubject.value;
    const updatedSlots = slots.map(slot => {
      if (selectedSlotIds.includes(slot.id)) {
        return { ...slot, status: 'booked' as const };
      }
      return slot;
    });
    this.slotsSubject.next(updatedSlots);
  }
}