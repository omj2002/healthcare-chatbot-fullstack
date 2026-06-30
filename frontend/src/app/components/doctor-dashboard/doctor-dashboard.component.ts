import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Appointment, User } from '../../models/interfaces';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <header class="dash-header">
        <div class="header-main">
          <div>
            <h1>👨‍⚕️ Doctor Dashboard</h1>
            <p>Manage your patient consultations and schedule</p>
          </div>
          <div class="doctor-profile-brief" *ngIf="doctor">
            <div class="profile-img">
              <img [src]="doctor.profileImage || 'assets/doctor_male_1.png'" alt="Doctor Profile">
            </div>
            <div class="profile-txt">
              <h3>{{doctor.name}}</h3>
              <span>{{doctor.role}}</span>
            </div>
          </div>
        </div>
      </header>

      <div class="stats-grid">
        <div class="stat-card">
          <span class="label">Total Appointments</span>
          <span class="value">{{appointments.length}}</span>
        </div>
        <div class="stat-card">
          <span class="label">Pending Requests</span>
          <span class="value">{{getPendingCount()}}</span>
        </div>
      </div>

      <section class="appointments-section">
        <h2>Upcoming Consultations</h2>
        
        <div class="table-wrapper">
          <table class="dash-table">
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Date & Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let appt of appointments">
                <td>
                   <div class="patient-cell" *ngIf="appt.user">
                      <strong>{{appt.user.name}}</strong>
                      <span>{{appt.user.email}}</span>
                   </div>
                </td>
                <td>{{appt.date | date:'medium'}}</td>
                <td>
                  <span class="status-pill" *ngIf="appt.status" [ngClass]="appt.status.toLowerCase()">
                    {{appt.status}}
                  </span>
                </td>
                <td class="actions">
                  <button *ngIf="appt.id && appt.status === 'Pending'" class="btn-success" (click)="updateStatus(appt.id, 'Confirmed')">Confirm</button>
                  <button *ngIf="appt.id && appt.status !== 'Completed' && appt.status !== 'Cancelled'" class="btn-danger" (click)="updateStatus(appt.id, 'Cancelled')">Cancel</button>
                  <button *ngIf="appt.id && appt.status === 'Confirmed'" class="btn-primary" (click)="updateStatus(appt.id, 'Completed')">Mark Complete</button>
                </td>
              </tr>
              <tr *ngIf="appointments.length === 0">
                <td colspan="4" class="empty-state">No appointments found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .dashboard-container { padding: 40px; max-width: 1200px; margin: 0 auto; }
    .dash-header { margin-bottom: 40px; }
    .dash-header h1 { margin: 0; font-size: 2.5rem; color: var(--primary-color); }
    .dash-header p { color: var(--text-muted); font-size: 1.1rem; }

    .header-main { display: flex; justify-content: space-between; align-items: center; }
    .doctor-profile-brief { display: flex; align-items: center; gap: 15px; background: rgba(255,255,255,0.03); padding: 10px 20px; border-radius: 50px; border: 1px solid rgba(255,255,255,0.05); }
    .profile-img { width: 45px; height: 45px; border-radius: 50%; overflow: hidden; border: 2px solid var(--primary-color); }
    .profile-img img { width: 100%; height: 100%; object-fit: cover; }
    .profile-txt h3 { margin: 0; font-size: 1rem; color: white; }
    .profile-txt span { font-size: 0.75rem; color: var(--text-muted); }

    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 40px; }
    .stat-card { background: var(--surface-color); padding: 25px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); }
    .stat-card .label { display: block; color: var(--text-muted); margin-bottom: 10px; font-size: 0.9rem; text-transform: uppercase; }
    .stat-card .value { font-size: 2rem; font-weight: bold; color: var(--primary-color); }

    .appointments-section h2 { margin-bottom: 25px; }
    .table-wrapper { background: var(--surface-color); border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.05); }
    .dash-table { width: 100%; border-collapse: collapse; text-align: left; }
    .dash-table th { padding: 15px 20px; background: rgba(255,255,255,0.02); color: var(--text-muted); font-weight: 500; font-size: 0.9rem; }
    .dash-table td { padding: 15px 20px; border-top: 1px solid rgba(255,255,255,0.05); }

    .patient-cell strong { display: block; color: var(--primary-color); }
    .patient-cell span { font-size: 0.8rem; color: var(--text-muted); }

    .status-pill { padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: bold; text-transform: uppercase; }
    .status-pill.pending { background: rgba(243, 156, 18, 0.1); color: #f39c12; }
    .status-pill.confirmed { background: rgba(52, 152, 219, 0.1); color: #3498db; }
    .status-pill.completed { background: rgba(46, 204, 113, 0.1); color: #2ecc71; }
    .status-pill.cancelled { background: rgba(231, 76, 60, 0.1); color: #e74c3c; }

    .actions { display: flex; gap: 10px; }
    .actions button { padding: 6px 12px; border-radius: 6px; border: none; font-size: 0.8rem; cursor: pointer; font-weight: bold; }
    .btn-success { background: #27ae60; color: white; }
    .btn-danger { background: #c0392b; color: white; }
    .btn-primary { background: var(--primary-color); color: white; }
    .empty-state { text-align: center; padding: 40px !important; color: var(--text-muted); }
  `]
})
export class DoctorDashboardComponent implements OnInit {
  appointments: Appointment[] = [];
  doctor: User | null = null;

  constructor(private apiService: ApiService, private authService: AuthService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.doctor = this.authService.getUser();
    this.loadAppointments();
  }

  loadAppointments() {
    console.log("DoctorDashboard: Fetching appointments...");
    this.apiService.getAppointments().subscribe({
      next: (res) => {
        console.log("DoctorDashboard: Received appointments data:", res);
        this.appointments = res;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("DoctorDashboard: API Error:", err);
        this.cdr.detectChanges();
      }
    });
  }

  getPendingCount() {
    return this.appointments.filter(a => a.status === 'Pending').length;
  }

  updateStatus(id: number, status: string) {
    this.apiService.updateAppointmentStatus(id, status).subscribe({
      next: () => this.loadAppointments(),
      error: (err) => alert("Failed to update status")
    });
  }
}
