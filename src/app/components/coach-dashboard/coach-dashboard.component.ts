import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SlotService } from '../../services/slot.service';
import { TimeSlot, SlotSummary } from '../../models/slot.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-coach-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <header class="header">
        <div class="header-content">
          <h1>Coach Dashboard - My Health Index</h1>
          <div class="header-actions">
            <span class="user-name">Welcome, {{ currentUser?.name }}</span>
            <button class="logout-btn" (click)="logout()">Logout</button>
          </div>
        </div>
      </header>

      <div class="main-content">
        <div class="dashboard-summary">
          <h2>Booking Overview</h2>
          <div class="summary-cards">
            <div class="summary-card total">
              <div class="card-icon">📅</div>
              <div class="card-content">
                <div class="card-value">{{ slotSummary.totalSlots }}</div>
                <div class="card-label">Total Slots</div>
              </div>
            </div>
            <div class="summary-card booked">
              <div class="card-icon">✅</div>
              <div class="card-content">
                <div class="card-value">{{ slotSummary.bookedSlots }}</div>
                <div class="card-label">Booked Slots</div>
              </div>
            </div>
            <div class="summary-card available">
              <div class="card-icon">🔓</div>
              <div class="card-content">
                <div class="card-value">{{ slotSummary.availableSlots }}</div>
                <div class="card-label">Available Slots</div>
              </div>
            </div>
            <div class="summary-card percentage">
              <div class="card-icon">📊</div>
              <div class="card-content">
                <div class="card-value">{{ getBookingPercentage() }}%</div>
                <div class="card-label">Utilization</div>
              </div>
            </div>
          </div>
        </div>

        <div class="calendar-section">
          <h2>Weekly Schedule Overview</h2>
          <div class="calendar-note">
            <p>📋 View-only calendar showing current slot bookings</p>
          </div>
          
          <div class="slots-grid">
            <div class="time-column">
              <div class="time-header">Time</div>
              <div *ngFor="let timeLabel of timeLabels" 
                   class="time-slot-label" 
                   [class.break-label]="timeLabel.isBreak">
                {{ timeLabel.display }}
              </div>
            </div>

            <div class="days-container">
              <div *ngFor="let day of days; let dayIndex = index" class="day-column">
                <div class="day-header">
                  <div class="day-name">{{ day }}</div>
                  <div class="day-date">{{ getDayDate(dayIndex) }}</div>
                  <div class="day-stats">
                    <span class="booked-count">{{ getDayBookedCount(day) }}</span>/{{ getDayTotalCount(day) }}
                  </div>
                </div>
                
                <div *ngFor="let slot of getSlotsByDay(day)" 
                     class="slot-item" 
                     [class.available]="slot.status === 'available' && !slot.isBreak"
                     [class.booked]="slot.status === 'booked' && !slot.isBreak"
                     [class.break-slot]="slot.isBreak">
                  
                  <div *ngIf="!slot.isBreak" class="slot-content">
                    <div class="slot-status">
                      <span class="status-indicator" 
                            [class.available]="slot.status === 'available'"
                            [class.booked]="slot.status === 'booked'">
                        {{ slot.status === 'available' ? '○' : '●' }}
                      </span>
                    </div>
                    <div class="slot-info">
                      <div class="slot-time">{{ slot.startTime }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="insights-section">
          <h2>Weekly Insights</h2>
          <div class="insights-grid">
            <div class="insight-card">
              <h3>Peak Hours</h3>
              <p>Most bookings occur between 10:00 AM - 12:00 PM</p>
            </div>
            <div class="insight-card">
              <h3>Popular Days</h3>
              <p>Tuesday and Wednesday have the highest booking rates</p>
            </div>
            <div class="insight-card">
              <h3>Availability</h3>
              <p>{{ slotSummary.availableSlots }} slots still available this week</p>
            </div>
          </div>
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

    .main-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
      display: flex;
      flex-direction: column;
      gap: 50px;
      position: relative;
      z-index: 5;
    }

    .dashboard-summary h2,
    .calendar-section h2,
    .insights-section h2 {
      color: #1f2937;
      font-size: 32px;
      font-weight: 800;
      margin-bottom: 30px;
      background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 25px;
    }

    .summary-card {
      background: rgba(255, 255, 255, 0.95);
      padding: 30px;
      border-radius: 20px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      gap: 20px;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      position: relative;
      overflow: hidden;
    }

    .summary-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #667eea, #764ba2);
    }

    .summary-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
    }

    .card-icon {
      font-size: 28px;
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 16px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .summary-card.total .card-icon {
      background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
    }

    .summary-card.booked .card-icon {
      background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%);
    }

    .summary-card.available .card-icon {
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
    }

    .summary-card.percentage .card-icon {
      background: linear-gradient(135deg, #fdf4ff 0%, #f3e8ff 100%);
    }

    .card-content {
      flex: 1;
    }

    .card-value {
      font-size: 36px;
      font-weight: 900;
      line-height: 1;
      margin-bottom: 8px;
    }

    .summary-card.total .card-value {
      color: #3b82f6;
      text-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
    }

    .summary-card.booked .card-value {
      color: #ef4444;
      text-shadow: 0 2px 4px rgba(239, 68, 68, 0.2);
    }

    .summary-card.available .card-value {
      color: #10b981;
      text-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
    }

    .summary-card.percentage .card-value {
      color: #8b5cf6;
      text-shadow: 0 2px 4px rgba(139, 92, 246, 0.2);
    }

    .card-label {
      color: #6b7280;
      font-size: 13px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .calendar-section {
      background: rgba(255, 255, 255, 0.95);
      padding: 40px;
      border-radius: 20px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .calendar-note {
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      border: 1px solid #0ea5e9;
      border-radius: 12px;
      padding: 16px 20px;
      margin-bottom: 30px;
      box-shadow: 0 4px 12px rgba(14, 165, 233, 0.1);
    }

    .calendar-note p {
      margin: 0;
      color: #0c4a6e;
      font-size: 14px;
      font-weight: 500;
    }

    .slots-grid {
      display: flex;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(226, 232, 240, 0.5);
    }

    .time-column {
      min-width: 120px;
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
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .time-slot-label {
      padding: 12px;
      border-bottom: 1px solid rgba(226, 232, 240, 0.3);
      font-size: 10px;
      text-align: center;
      color: #6b7280;
      min-height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      transition: all 0.3s ease;
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
      min-height: 65px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 4px;
      transition: all 0.3s ease;
    }

    .day-header:hover {
      background: linear-gradient(135deg, #ebf4ff 0%, #dbeafe 100%);
    }

    .day-name {
      font-weight: 700;
      font-size: 11px;
      color: #374151;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .day-date {
      font-size: 16px;
      font-weight: 800;
      color: #1f2937;
    }

    .day-stats {
      font-size: 10px;
      color: #6b7280;
      font-weight: 500;
    }

    .booked-count {
      color: #ef4444;
      font-weight: 700;
    }

    .slot-item {
      border-bottom: 1px solid rgba(226, 232, 240, 0.3);
      min-height: 40px;
      display: flex;
      align-items: center;
      transition: all 0.3s ease;
    }

    .slot-item:hover {
      background: rgba(102, 126, 234, 0.02);
    }

    .slot-item.available {
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      border-left: 3px solid #10b981;
    }

    .slot-item.booked {
      background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
      border-left: 3px solid #9ca3af;
      opacity: 0.8;
    }

    .slot-item.break-slot {
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      border-left: 3px solid #f59e0b;
    }

    .slot-content {
      display: flex;
      align-items: center;
      padding: 8px 12px;
      width: 100%;
      gap: 8px;
    }

    .slot-status {
      display: flex;
      align-items: center;
    }

    .status-indicator {
      font-size: 14px;
      font-weight: 900;
    }

    .status-indicator.available {
      color: #10b981;
    }

    .status-indicator.booked {
      color: #ef4444;
    }

    .slot-info {
      flex: 1;
    }

    .slot-time {
      font-size: 11px;
      font-weight: 600;
      color: #1f2937;
    }

    .insights-section {
      background: rgba(255, 255, 255, 0.95);
      padding: 40px;
      border-radius: 20px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .insights-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 25px;
    }

    .insight-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .insight-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
      pointer-events: none;
    }

    .insight-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 50px rgba(102, 126, 234, 0.4);
    }

    .insight-card h3 {
      margin: 0 0 12px 0;
      font-size: 20px;
      font-weight: 700;
      position: relative;
      z-index: 1;
    }

    .insight-card p {
      margin: 0;
      font-size: 15px;
      opacity: 0.9;
      line-height: 1.5;
      position: relative;
      z-index: 1;
      font-weight: 500;
    }

    @media (max-width: 768px) {
      .summary-cards {
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 20px;
      }

      .summary-card {
        padding: 20px;
        flex-direction: column;
        text-align: center;
        gap: 15px;
      }

      .card-value {
        font-size: 28px;
      }

      .slots-grid {
        overflow-x: auto;
      }

      .days-container {
        min-width: 500px;
      }

      .insights-grid {
        grid-template-columns: 1fr;
      }

      .main-content {
        padding: 30px 15px;
        gap: 40px;
      }

      .calendar-section,
      .insights-section {
        padding: 30px 20px;
      }
    }
  `]
})
export class CoachDashboardComponent implements OnInit {
  currentUser: User | null = null;
  slots: TimeSlot[] = [];
  slotSummary: SlotSummary = { totalSlots: 0, bookedSlots: 0, availableSlots: 0 };

  days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  timeLabels = [
    { display: '09:00', isBreak: false },
    { display: '09:20', isBreak: false },
    { display: '09:40', isBreak: false },
    { display: '10:00', isBreak: false },
    { display: '10:20', isBreak: false },
    { display: '10:40', isBreak: false },
    { display: '11:00', isBreak: false },
    { display: '11:20', isBreak: false },
    { display: '11:40', isBreak: false },
    { display: '12:00', isBreak: false },
    { display: '12:20', isBreak: false },
    { display: '12:40', isBreak: false },
    { display: '02:00', isBreak: true },
    { display: '02:20', isBreak: true },
    { display: '02:40', isBreak: true },
    { display: '03:00', isBreak: true },
    { display: '03:20', isBreak: true },
    { display: '03:40', isBreak: true },
    { display: '04:00', isBreak: true }
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

  getDayBookedCount(day: string): number {
    return this.getSlotsByDay(day).filter(slot => slot.status === 'booked' && !slot.isBreak).length;
  }

  getDayTotalCount(day: string): number {
    return this.getSlotsByDay(day).filter(slot => !slot.isBreak).length;
  }

  getBookingPercentage(): number {
    if (this.slotSummary.totalSlots === 0) return 0;
    return Math.round((this.slotSummary.bookedSlots / this.slotSummary.totalSlots) * 100);
  }
}