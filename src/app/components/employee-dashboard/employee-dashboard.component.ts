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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      position: relative;
    }

    .dashboard-container::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
      pointer-events: none;
    }

    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px 0;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(10px);
      position: relative;
      z-index: 10;
    }

    .header::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
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
      font-size: 28px;
      font-weight: 700;
      background: linear-gradient(45deg, #ffffff, #e0e7ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .user-name {
      font-size: 14px;
      opacity: 0.9;
      font-weight: 500;
    }

    .logout-btn {
      background: rgba(255,255,255,0.15);
      color: white;
      border: 1px solid rgba(255,255,255,0.2);
      padding: 10px 20px;
      border-radius: 25px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-weight: 500;
      backdrop-filter: blur(10px);
    }

    .logout-btn:hover {
      background: rgba(255,255,255,0.25);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .nav-bar {
      background: white;
      border-bottom: 1px solid rgba(226, 232, 240, 0.5);
      padding: 0 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      position: relative;
      z-index: 9;
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
      color: #6b7280;
      font-weight: 600;
      border-bottom: 2px solid transparent;
      transition: all 0.3s ease;
      position: relative;
    }

    .nav-item:hover {
      color: #667eea;
      transform: translateY(-1px);
    }

    .nav-item.active {
      color: #667eea;
      border-bottom-color: #667eea;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
    }

    .main-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 30px 20px;
      position: relative;
      z-index: 5;
    }

    .content-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 20px;
      flex-wrap: wrap;
      gap: 30px;
      background: rgba(255, 255, 255, 0.95);
      padding: 25px;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .date-info {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .slots-label {
      font-size: 16px;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 5px;
    }

    .summary-stats {
      display: flex;
      gap: 40px;
      flex-wrap: wrap;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 15px;
      background: rgba(255, 255, 255, 0.7);
      border-radius: 12px;
      min-width: 100px;
      transition: all 0.3s ease;
      border: 1px solid rgba(255, 255, 255, 0.3);
    }

    .stat-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
      background: rgba(255, 255, 255, 0.9);
    }

    .stat-label {
      font-size: 11px;
      color: #6b7280;
      text-align: center;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .stat-value {
      font-size: 28px;
      font-weight: 800;
      line-height: 1;
    }

    .stat-value.total {
      color: #3b82f6;
      text-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
    }

    .stat-value.booked {
      color: #ef4444;
      text-shadow: 0 2px 4px rgba(239, 68, 68, 0.2);
    }

    .stat-value.available {
      color: #10b981;
      text-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
    }

    .date-range {
      display: flex;
      align-items: center;
      gap: 15px;
      font-size: 14px;
      color: #6b7280;
      font-weight: 500;
    }

    .block-slots-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 25px;
      cursor: pointer;
      font-weight: 700;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-size: 12px;
    }

    .block-slots-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
    }

    .block-slots-btn:disabled {
      background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
      cursor: not-allowed;
      box-shadow: none;
      transform: none;
    }

    .slots-grid {
      display: flex;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .time-column {
      min-width: 140px;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border-right: 1px solid rgba(226, 232, 240, 0.5);
    }

    .time-header {
      padding: 20px 15px;
      font-weight: 700;
      text-align: center;
      border-bottom: 1px solid rgba(226, 232, 240, 0.5);
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .time-slot-label {
      padding: 15px 12px;
      border-bottom: 1px solid rgba(226, 232, 240, 0.3);
      font-size: 11px;
      text-align: center;
      color: #6b7280;
      min-height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .time-slot-label:hover {
      background: rgba(102, 126, 234, 0.05);
      color: #667eea;
    }

    .time-slot-label.break-label {
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      color: #92400e;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .days-container {
      display: flex;
      flex: 1;
    }

    .day-column {
      flex: 1;
      border-right: 1px solid rgba(226, 232, 240, 0.3);
      transition: all 0.3s ease;
    }

    .day-column:hover {
      background: rgba(102, 126, 234, 0.02);
    }

    .day-column:last-child {
      border-right: none;
    }

    .day-header {
      padding: 15px 12px;
      text-align: center;
      border-bottom: 1px solid rgba(226, 232, 240, 0.5);
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      min-height: 75px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 4px;
      transition: all 0.3s ease;
    }

    .day-header:hover {
      background: linear-gradient(135deg, #ebf4ff 0%, #dbeafe 100%);
    }

    .day-header.current-day {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
      transform: scale(1.02);
      z-index: 2;
      position: relative;
    }

    .day-name {
      font-weight: 700;
      font-size: 11px;
      color: inherit;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .day-date {
      font-size: 16px;
      font-weight: 800;
      color: inherit;
    }

    .day-count {
      font-size: 10px;
      color: inherit;
      opacity: 0.8;
      font-weight: 500;
    }

    .slot-item {
      border-bottom: 1px solid rgba(226, 232, 240, 0.3);
      min-height: 50px;
      display: flex;
      align-items: center;
      position: relative;
      transition: all 0.3s ease;
    }

    .slot-item:hover {
      background: rgba(102, 126, 234, 0.02);
    }

    .slot-item.available {
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      border-left: 4px solid #10b981;
      box-shadow: inset 0 1px 0 rgba(16, 185, 129, 0.1);
    }

    .slot-item.available:hover {
      background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
      transform: translateX(2px);
    }

    .slot-item.booked {
      background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
      color: #6b7280;
      border-left: 4px solid #9ca3af;
      opacity: 0.7;
    }

    .slot-item.break-slot {
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      border-left: 4px solid #f59e0b;
    }

    .slot-content {
      display: flex;
      align-items: center;
      padding: 10px 15px;
      width: 100%;
      gap: 12px;
    }

    .slot-checkbox {
      width: 18px;
      height: 18px;
      cursor: pointer;
      accent-color: #667eea;
      transform: scale(1.1);
    }

    .slot-checkbox:disabled {
      cursor: not-allowed;
    }

    .slot-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .slot-time {
      font-size: 12px;
      font-weight: 600;
      color: #1f2937;
    }

    .slot-duration {
      font-size: 10px;
      color: #6b7280;
      font-weight: 500;
    }

    .break-divider {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: white;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
    }

    .success-message {
      position: fixed;
      top: 30px;
      right: 30px;
      z-index: 1000;
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .success-content {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 8px 32px rgba(16, 185, 129, 0.4);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      font-weight: 600;
    }

    .success-content button {
      background: none;
      border: none;
      color: white;
      font-size: 20px;
      cursor: pointer;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: all 0.3s ease;
    }

    .success-content button:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: scale(1.1);
    }

    @media (max-width: 768px) {
      .content-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .summary-stats {
        gap: 15px;
        justify-content: center;
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

      .content-header {
        padding: 20px;
        gap: 20px;
      }

      .stat-item {
        padding: 12px;
        min-width: 80px;
      }

      .stat-value {
        font-size: 24px;
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