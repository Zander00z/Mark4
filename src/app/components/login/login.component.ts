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
    }

    .login-card {
      background: white;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
      width: 100%;
      max-width: 400px;
    }

    h1 {
      text-align: center;
      color: #333;
      margin-bottom: 30px;
      font-size: 28px;
      font-weight: 600;
    }

    .role-selector {
      display: flex;
      gap: 10px;
      margin-bottom: 30px;
    }

    .role-btn {
      flex: 1;
      padding: 12px;
      border: 2px solid #e2e8f0;
      background: white;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-weight: 500;
    }

    .role-btn:hover {
      border-color: #6B46C1;
    }

    .role-btn.active {
      background: #6B46C1;
      color: white;
      border-color: #6B46C1;
    }

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      margin-bottom: 5px;
      font-weight: 500;
      color: #374151;
    }

    input {
      width: 100%;
      padding: 12px;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-size: 16px;
      transition: border-color 0.3s ease;
      box-sizing: border-box;
    }

    input:focus {
      outline: none;
      border-color: #6B46C1;
    }

    .login-btn {
      width: 100%;
      padding: 12px;
      background: #6B46C1;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.3s ease;
    }

    .login-btn:hover:not(:disabled) {
      background: #553C9A;
    }

    .login-btn:disabled {
      background: #9CA3AF;
      cursor: not-allowed;
    }

    .error {
      color: #EF4444;
      font-size: 14px;
      margin-top: 5px;
    }

    .error-message {
      color: #EF4444;
      text-align: center;
      margin-top: 15px;
      padding: 10px;
      background: #FEF2F2;
      border-radius: 6px;
      border: 1px solid #FECACA;
    }

    .demo-credentials {
      margin-top: 30px;
      padding: 20px;
      background: #F8FAFC;
      border-radius: 8px;
      border: 1px solid #E2E8F0;
    }

    .demo-credentials h3 {
      margin: 0 0 10px 0;
      color: #374151;
      font-size: 16px;
    }

    .demo-credentials p {
      margin: 5px 0;
      font-size: 14px;
      color: #6B7280;
    }

    @media (max-width: 480px) {
      .login-card {
        padding: 30px 20px;
      }
      
      .role-selector {
        flex-direction: column;
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