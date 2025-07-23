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

    .main-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 30px 20px;
      display: flex;
      flex-direction: column;
      gap: 40px;
    }

    .dashboard-summary h2,
    .calendar-section h2,
    .insights-section h2 {
      color: #1F2937;
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 20px;
    }

    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }

    .summary-card {
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      display: flex;
      align-items: center;
      gap: 16px;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .summary-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .card-icon {
      font-size: 24px;
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
    }

    .summary-card.total .card-icon {
      background: #EBF4FF;
    }

    .summary-card.booked .card-icon {
      background: #FEF2F2;
    }

    .summary-card.available .card-icon {
      background: #F0FDF4;
    }

    .summary-card.percentage .card-icon {
      background: #FDF4FF;
    }

    .card-content {
      flex: 1;
    }

    .card-value {
      font-size: 32px;
      font-weight: 800;
      line-height: 1;
      margin-bottom: 4px;
    }

    .summary-card.total .card-value {
      color: #3B82F6;
    }

    .summary-card.booked .card-value {
      color: #EF4444;
    }

    .summary-card.available .card-value {
      color: #10B981;
    }

    .summary-card.percentage .card-value {
      color: #8B5CF6;
    }

    .card-label {
      color: #6B7280;
      font-size: 14px;
      font-weight: 500;
    }

    .calendar-section {
      background: white;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }

    .calendar-note {
      background: #F0F9FF;
      border: 1px solid #0EA5E9;
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 20px;
    }

    .calendar-note p {
      margin: 0;
      color: #0C4A6E;
      font-size: 14px;
    }

    .slots-grid {
      display: flex;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #e2e8f0;
    }

    .time-column {
      min-width: 100px;
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
      padding: 10px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 11px;
      text-align: center;
      color: #6B7280;
      min-height: 36px;
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
      min-height: 55px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 2px;
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

    .day-stats {
      font-size: 10px;
      color: #6B7280;
    }

    .booked-count {
      color: #EF4444;
      font-weight: 600;
    }

    .slot-item {
      border-bottom: 1px solid #e2e8f0;
      min-height: 36px;
      display: flex;
      align-items: center;
    }

    .slot-item.available {
      background: #F0FDF4;
    }

    .slot-item.booked {
      background: #F3F4F6;
    }

    .slot-item.break-slot {
      background: #FEF3C7;
    }

    .slot-content {
      display: flex;
      align-items: center;
      padding: 6px 8px;
      width: 100%;
      gap: 6px;
    }

    .slot-status {
      display: flex;
      align-items: center;
    }

    .status-indicator {
      font-size: 12px;
      font-weight: bold;
    }

    .status-indicator.available {
      color: #10B981;
    }

    .status-indicator.booked {
      color: #EF4444;
    }

    .slot-info {
      flex: 1;
    }

    .slot-time {
      font-size: 10px;
      font-weight: 500;
      color: #374151;
    }

    .insights-section {
      background: white;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }

    .insights-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }

    .insight-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .insight-card h3 {
      margin: 0 0 12px 0;
      font-size: 18px;
      font-weight: 600;
    }

    .insight-card p {
      margin: 0;
      font-size: 14px;
      opacity: 0.9;
      line-height: 1.5;
    }

    @media (max-width: 768px) {
      .summary-cards {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 15px;
      }

      .summary-card {
        padding: 16px;
        flex-direction: column;
        text-align: center;
        gap: 12px;
      }

      .card-value {
        font-size: 24px;
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