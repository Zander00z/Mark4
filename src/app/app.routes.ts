import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { EmployeeDashboardComponent } from './components/employee-dashboard/employee-dashboard.component';
import { CoachDashboardComponent } from './components/coach-dashboard/coach-dashboard.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { 
    path: 'employee-dashboard', 
    component: EmployeeDashboardComponent,
    canActivate: [AuthGuard],
    data: { role: 'employee' }
  },
  { 
    path: 'coach-dashboard', 
    component: CoachDashboardComponent,
    canActivate: [AuthGuard],
    data: { role: 'coach' }
  },
  { path: 'unauthorized', redirectTo: '/login' },
  { path: '**', redirectTo: '/login' }
];