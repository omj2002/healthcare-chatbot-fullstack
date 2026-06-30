import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent) },
  { path: 'login', loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent) },
  { path: 'chat', loadComponent: () => import('./components/chatbot/chatbot.component').then(m => m.ChatbotComponent) },
  { path: 'history', loadComponent: () => import('./components/history/history.component').then(m => m.HistoryComponent) },
  { path: 'doctor/:id', loadComponent: () => import('./components/doctor-profile/doctor-profile.component').then(m => m.DoctorProfileComponent) },
  { path: 'appointments', loadComponent: () => import('./components/appointments/appointments.component').then(m => m.AppointmentsComponent) },
  { path: 'doctor-dashboard', loadComponent: () => import('./components/doctor-dashboard/doctor-dashboard.component').then(m => m.DoctorDashboardComponent) },
  { path: 'staff-dashboard', loadComponent: () => import('./components/staff-dashboard/staff-dashboard.component').then(m => m.StaffDashboardComponent) },
  { path: '**', redirectTo: '' }
];
