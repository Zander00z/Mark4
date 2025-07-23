import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginCredentials } from '../../models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <h1>Health Index Login</h1>
        
        <div class="role-selector">
          <button 
            class="role-btn" 
            [class.active]="selectedRole === 'employee'"
            (click)="selectRole('employee')">
            Employee Login
          </button>
          <button 
            class="role-btn" 
            [class.active]="selectedRole === 'coach'"
            (click)="selectRole('coach')">
            Coach Login
          </button>
        </div>

        <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              [(ngModel)]="credentials.email"
              required
              #email="ngModel"
              placeholder="Enter your email">
            <div *ngIf="email.invalid && email.touched" class="error">
              Email is required
            </div>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              [(ngModel)]="credentials.password"
              required
              #password="ngModel"
              placeholder="Enter your password">
            <div *ngIf="password.invalid && password.touched" class="error">
              Password is required
            </div>
          </div>

          <button 
            type="submit" 
            class="login-btn" 
            [disabled]="loginForm.invalid || isLoading">
            {{ isLoading ? 'Logging in...' : 'Login' }}
          </button>

          <div *ngIf="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
        </form>

        <div class="demo-credentials">
          <h3>Demo Credentials:</h3>
          <p><strong>Employee:</strong> employee@example.com / password</p>
          <p><strong>Coach:</strong> coach@example.com / password</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
      position: relative;
    }

    .login-container::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.05)"/><circle cx="20" cy="80" r="0.5" fill="rgba(255,255,255,0.05)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
      pointer-events: none;
    }

    .login-card {
      background: rgba(255, 255, 255, 0.95);
      padding: 50px;
      border-radius: 24px;
      box-shadow: 0 25px 80px rgba(0, 0, 0, 0.15);
      width: 100%;
      max-width: 450px;
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      position: relative;
      z-index: 1;
    }

    .login-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #667eea, #764ba2);
      border-radius: 24px 24px 0 0;
    }

    h1 {
      text-align: center;
      color: #1f2937;
      margin-bottom: 40px;
      font-size: 32px;
      font-weight: 800;
      background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .role-selector {
      display: flex;
      gap: 12px;
      margin-bottom: 40px;
      padding: 6px;
      background: rgba(102, 126, 234, 0.1);
      border-radius: 16px;
    }

    .role-btn {
      flex: 1;
      padding: 14px 20px;
      border: none;
      background: transparent;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-weight: 600;
      color: #6b7280;
      position: relative;
    }

    .role-btn:hover {
      color: #667eea;
      background: rgba(255, 255, 255, 0.5);
    }

    .role-btn.active {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
      transform: translateY(-1px);
    }

    .form-group {
      margin-bottom: 25px;
    }

    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: #374151;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    input {
      width: 100%;
      padding: 16px 20px;
      border: 2px solid rgba(226, 232, 240, 0.5);
      border-radius: 12px;
      font-size: 16px;
      transition: border-color 0.3s ease;
      box-sizing: border-box;
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(10px);
    }

    input:focus {
      outline: none;
      border-color: #667eea;
      background: rgba(255, 255, 255, 0.95);
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .login-btn {
      width: 100%;
      padding: 16px 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 17px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }

    .login-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
    }

    .login-btn:disabled {
      background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    .error {
      color: #ef4444;
      font-size: 13px;
      margin-top: 8px;
      font-weight: 500;
    }

    .error-message {
      color: #ef4444;
      text-align: center;
      margin-top: 20px;
      padding: 12px 16px;
      background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
      border-radius: 8px;
      border: 1px solid #fecaca;
      font-weight: 500;
    }

    .demo-credentials {
      margin-top: 40px;
      padding: 25px;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border-radius: 12px;
      border: 1px solid rgba(226, 232, 240, 0.5);
    }

    .demo-credentials h3 {
      margin: 0 0 10px 0;
      color: #1f2937;
      font-size: 17px;
      font-weight: 700;
    }

    .demo-credentials p {
      margin: 5px 0;
      font-size: 13px;
      color: #6b7280;
      font-weight: 500;
    }

    @media (max-width: 480px) {
      .login-card {
        padding: 40px 25px;
        margin: 15px;
      }
      
      .role-selector {
        flex-direction: column;
        gap: 8px;
      }

      h1 {
        font-size: 28px;
        margin-bottom: 30px;
      }
    }
  `]
})
export class LoginComponent {
  selectedRole: 'employee' | 'coach' = 'employee';
  credentials: LoginCredentials = { email: '', password: '' };
  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  selectRole(role: 'employee' | 'coach'): void {
    this.selectedRole = role;
    this.credentials.email = role === 'employee' ? 'employee@example.com' : 'coach@example.com';
    this.credentials.password = 'password';
  }

  onSubmit(): void {
    if (this.isLoading) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.credentials).subscribe({
      next: (user) => {
        this.isLoading = false;
        if (user) {
          if (user.role === 'employee') {
            this.router.navigate(['/employee-dashboard']);
          } else if (user.role === 'coach') {
            this.router.navigate(['/coach-dashboard']);
          }
        } else {
          this.errorMessage = 'Invalid credentials. Please try again.';
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Login failed. Please try again.';
      }
    });
  }
}