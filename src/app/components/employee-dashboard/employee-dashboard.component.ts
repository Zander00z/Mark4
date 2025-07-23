import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SlotService } from '../../services/slot.service';
import { TimeSlot, SlotSummary } from '../../models/slot.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <header class="header">
        <div class="header-content">
          <h1>My Health Index</h1>
          <div class="header-actions">
            <span class="user-name">Welcome, {{ currentUser?.name }}</span>
            <button class="logout-btn" (click)="logout()">Logout</button>
          </div>
        </div>
      </header>

      <nav class="nav-bar">
        <div class="nav-content">
          <a href="#" class="nav-item">Dashboard</a>
          <a href="#" class="nav-item active">Slot Booked</a>
          <a href="#" class="nav-item">Employees</a>
          <a href="#" class="nav-item">Coaches</a>
        </div>
      </nav>

      <div class="main-content">
        <div class="content-header">
          <div class="date-info">
            <span class="slots-label">Slots (weekly)</span>
            <div class="summary-stats">
              <div class="stat-item">
                <span class="stat-label">Total No. of Slots</span>
                <span class="stat-value total">{{ slotSummary.totalSlots }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Booked Slots</span>
                <span class="stat-value booked">{{ slotSummary.bookedSlots }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Available Slots</span>
                <span class="stat-value available">{{ slotSummary.availableSlots }}</span>
              </div>
            </div>
          </div>
          <div class="date-range">
            <span>08/03/2023 - 13/03/2023</span>
            <button class="block-slots-btn" (click)="blockSelectedSlots()" 
                    [disabled]="selectedSlots.length === 0">
              Block Slots
            </button>
          </div>
        </div>

        <div class="slots-grid">
          <div class="time-column">
            <div class="time-header">SLOTS</div>
            <div *ngFor="let timeLabel of timeLabels; let i = index" 
                 class="time-slot-label" 
                 [class.break-label]="timeLabel.isBreak">
              {{ timeLabel.label }}
            </div>
          </div>

          <div class="days-container">
            <div *ngFor="let day of days; let dayIndex = index" class="day-column">
              <div class="day-header" [class.current-day]="isCurrentDay(dayIndex)">
                <div class="day-name">{{ day }}</div>
                <div class="day-date">{{ getDayDate(dayIndex) }}</div>
                <div class="day-count">{{ getDaySlotCount(day) }}</div>
              </div>
              
              <div *ngFor="let slot of getSlotsByDay(day); let slotIndex = index" 
                   class="slot-item" 
                   [class.available]="slot.status === 'available' && !slot.isBreak"
                   [class.booked]="slot.status === 'booked' && !slot.isBreak"
                   [class.break-slot]="slot.isBreak">
                
                <div *ngIf="!slot.isBreak" class="slot-content">
                  <input type="checkbox" 
                         class="slot-checkbox"
                         [checked]="selectedSlots.includes(slot.id)"
                         (change)="onSlotSelect(slot.id, $event)"
                         [disabled]="slot.status === 'booked'">
                  <div class="slot-info">
                    <div class="slot-time">{{ slot.startTime }} - {{ slot.endTime }}</div>
                    <div class="slot-duration">{{ slot.duration }} mins</div>
                  </div>
                </div>
                
                <div *ngIf="slot.isBreak && slotIndex === 0" class="break-divider">
                  Break
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="showSuccessMessage" class="success-message">
        <div class="success-content">
          <span>✓ Slots blocked successfully!</span>
          <button (click)="showSuccessMessage = false">×</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      min-height: 100vh;
      background: #f8fafc;
    }

    .header {
      background: #6B46C1;
      color: white;
      padding: 16px 0;
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .user-name {
      font-size: 14px;
    }

    .logout-btn {
      background: rgba(255,255,255,0.2);
      color: white;
      border: 1px solid rgba(255,255,255,0.3);
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.3s ease;
    }

    .logout-btn:hover {
      background: rgba(255,255,255,0.3);
    }

    .nav-bar {
      background: white;
      border-bottom: 1px solid #e2e8f0;
      padding: 0 20px;
    }

    .nav-content {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      gap: 40px;
    }

    .nav-item {
      padding: 16px 0;
      text-decoration: none;
      color: #64748b;
      font-weight: 500;
      border-bottom: 2px solid transparent;
      transition: all 0.3s ease;
    }

    .nav-item:hover {
      color: #6B46C1;
    }

    .nav-item.active {
      color: #6B46C1;
      border-bottom-color: #6B46C1;
    }

    .main-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .content-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 20px;
      flex-wrap: wrap;
      gap: 20px;
    }

    .date-info {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .slots-label {
      font-size: 16px;
      font-weight: 600;
      color: #374151;
    }

    .summary-stats {
      display: flex;
      gap: 30px;
      flex-wrap: wrap;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 5px;
    }

    .stat-label {
      font-size: 12px;
      color: #6B7280;
      text-align: center;
    }

    .stat-value {
      font-size: 24px;
      font-weight: 700;
    }

    .stat-value.total {
      color: #3B82F6;
    }

    .stat-value.booked {
      color: #EF4444;
    }

    .stat-value.available {
      color: #10B981;
    }

    .date-range {
      display: flex;
      align-items: center;
      gap: 15px;
      font-size: 14px;
      color: #6B7280;
    }

    .block-slots-btn {
      background: #6B46C1;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: background 0.3s ease;
    }

    .block-slots-btn:hover:not(:disabled) {
      background: #553C9A;
    }

    .block-slots-btn:disabled {
      background: #9CA3AF;
      cursor: not-allowed;
    }

    .slots-grid {
      display: flex;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .time-column {
      min-width: 120px;
      background: #f8fafc;
      border-right: 1px solid #e2e8f0;
    }

    .time-header {
      padding: 15px 10px;
      font-weight: 600;
      text-align: center;
      border-bottom: 1px solid #e2e8f0;
      background: #f1f5f9;
      color: #374151;
    }

    .time-slot-label {
      padding: 12px 10px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 12px;
      text-align: center;
      color: #6B7280;
      min-height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .time-slot-label.break-label {
      background: #FEF3C7;
      color: #92400E;
      font-weight: 600;
    }

    .days-container {
      display: flex;
      flex: 1;
    }

    .day-column {
      flex: 1;
      border-right: 1px solid #e2e8f0;
    }

    .day-column:last-child {
      border-right: none;
    }

    .day-header {
      padding: 10px;
      text-align: center;
      border-bottom: 1px solid #e2e8f0;
      background: #f8fafc;
      min-height: 65px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 2px;
    }

    .day-header.current-day {
      background: #EBF4FF;
      border-left: 3px solid #3B82F6;
      border-right: 3px solid #3B82F6;
    }

    .day-name {
      font-weight: 600;
      font-size: 12px;
      color: #374151;
    }

    .day-date {
      font-size: 14px;
      font-weight: 700;
      color: #1F2937;
    }

    .day-count {
      font-size: 10px;
      color: #6B7280;
    }

    .slot-item {
      border-bottom: 1px solid #e2e8f0;
      min-height: 44px;
      display: flex;
      align-items: center;
      position: relative;
    }

    .slot-item.available {
      border: 2px solid #10B981;
      border-bottom: 2px solid #10B981;
      background: #F0FDF4;
    }

    .slot-item.booked {
      background: #F3F4F6;
      color: #6B7280;
    }

    .slot-item.break-slot {
      background: #FEF3C7;
      border-color: #F59E0B;
    }

    .slot-content {
      display: flex;
      align-items: center;
      padding: 8px 12px;
      width: 100%;
      gap: 8px;
    }

    .slot-checkbox {
      width: 16px;
      height: 16px;
      cursor: pointer;
    }

    .slot-checkbox:disabled {
      cursor: not-allowed;
    }

    .slot-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .slot-time {
      font-size: 11px;
      font-weight: 500;
      color: #374151;
    }

    .slot-duration {
      font-size: 10px;
      color: #6B7280;
    }

    .break-divider {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      background: #F59E0B;
      color: white;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
    }

    .success-message {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
    }

    .success-content {
      background: #10B981;
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .success-content button {
      background: none;
      border: none;
      color: white;
      font-size: 18px;
      cursor: pointer;
      padding: 0;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    @media (max-width: 768px) {
      .content-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .summary-stats {
        gap: 15px;
      }

      .slots-grid {
        overflow-x: auto;
      }

      .days-container {
        min-width: 600px;
      }

      .day-column {
        min-width: 100px;
      }
    }
  `]
})
export class EmployeeDashboardComponent implements OnInit {
  currentUser: User | null = null;
  slots: TimeSlot[] = [];
  slotSummary: SlotSummary = { totalSlots: 0, bookedSlots: 0, availableSlots: 0 };
  selectedSlots: string[] = [];
  showSuccessMessage = false;

  days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  timeLabels = [
    { label: '1st', isBreak: false },
    { label: '2nd', isBreak: false },
    { label: '3rd', isBreak: false },
    { label: '4th', isBreak: false },
    { label: '5th', isBreak: false },
    { label: '6th', isBreak: false },
    { label: '7th', isBreak: false },
    { label: '8th', isBreak: false },
    { label: '9th', isBreak: false },
    { label: '10th', isBreak: false },
    { label: '11th', isBreak: false },
    { label: '12th', isBreak: false },
    { label: 'Break', isBreak: true },
    { label: '13th', isBreak: true },
    { label: '14th', isBreak: true },
    { label: '15th', isBreak: true },
    { label: '16th', isBreak: true },
    { label: '17th', isBreak: true },
    { label: '18th', isBreak: true },
    { label: '19th', isBreak: true }
  ];

  constructor(
    private authService: AuthService,
    private slotService: SlotService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    
    this.slotService.getSlots().subscribe(slots => {
      this.slots = slots;
      this.slotSummary = this.slotService.getSlotSummary();
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getSlotsByDay(day: string): TimeSlot[] {
    return this.slots.filter(slot => slot.day === day);
  }

  getDayDate(dayIndex: number): string {
    const date = new Date();
    date.setDate(date.getDate() + dayIndex);
    return String(date.getDate()).padStart(2, '0');
  }

  getDaySlotCount(day: string): string {
    const daySlots = this.getSlotsByDay(day).filter(slot => !slot.isBreak);
    const available = daySlots.filter(slot => slot.status === 'available').length;
    return `${available}`;
  }

  isCurrentDay(dayIndex: number): boolean {
    return dayIndex === 0;
  }

  onSlotSelect(slotId: string, event: any): void {
    if (event.target.checked) {
      this.selectedSlots.push(slotId);
    } else {
      this.selectedSlots = this.selectedSlots.filter(id => id !== slotId);
    }
  }

  blockSelectedSlots(): void {
    if (this.selectedSlots.length === 0) return;

    this.slotService.blockSelectedSlots(this.selectedSlots);
    this.selectedSlots = [];
    this.showSuccessMessage = true;

    setTimeout(() => {
      this.showSuccessMessage = false;
    }, 3000);
  }
}