import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { Appointment } from '../../models/interfaces';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="appointments-container">
      <h2>📅 My Appointments</h2>
      
      <div *ngIf="loading" class="loading">Loading appointments...</div>
      
      <div *ngIf="!loading && appointments.length === 0" class="no-appointments">
        <p>You have no appointments booked yet.</p>
        <p>Go to the Chatbot to find doctors and book a consultation!</p>
      </div>

      <div class="appointments-grid" *ngIf="!loading && appointments.length > 0">
        <div class="appt-card" *ngFor="let appt of appointments">
          <div class="appt-header">
            <h3>{{ appt.doctor?.name || 'Doctor' }}</h3>
            <span class="status-badge" [ngClass]="appt.status?.toLowerCase()">{{ appt.status }}</span>
          </div>
          <p class="spec">{{ appt.doctor?.specialization }}</p>
          <p><strong>Date:</strong> {{ appt.date | date:'mediumDate' }}</p>
          <p><strong>Location:</strong> {{ appt.doctor?.location }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .appointments-container {
      max-width: 800px;
      margin: 40px auto;
      padding: 30px;
      background: var(--surface-color);
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }
    h2 {
      margin-top: 0;
      color: var(--primary-color);
      border-bottom: 2px solid rgba(0, 210, 255, 0.1);
      padding-bottom: 15px;
      margin-bottom: 25px;
    }
    .loading, .no-appointments {
      text-align: center;
      padding: 40px;
      color: var(--text-muted);
      font-size: 1.1rem;
    }
    .appointments-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }
    .appt-card {
      background: rgba(0,0,0,0.2);
      border: 1px solid rgba(255,255,255,0.05);
      border-radius: 10px;
      padding: 20px;
      transition: transform 0.2s;
    }
    .appt-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    }
    .appt-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .appt-header h3 {
      margin: 0;
      font-size: 1.2rem;
    }
    .status-badge {
      font-size: 0.8rem;
      padding: 4px 10px;
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.1);
    }
    .status-badge.pending { background: #ffbc00; color: #fff; }
    .status-badge.confirmed { background: #00d2ff; color: #fff; }
    .status-badge.completed { background: #00e676; color: #fff; }
    .spec {
      color: var(--primary-color);
      margin-top: 0;
      margin-bottom: 15px;
      font-weight: 500;
    }
    p {
      margin: 8px 0;
      font-size: 0.95rem;
    }
  `]
})
export class AppointmentsComponent implements OnInit {
  appointments: Appointment[] = [];
  loading = true;

  constructor(private apiService: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loading = true;
    this.apiService.getAppointments().subscribe({
      next: (res) => {
        console.log("AppointmentsComponent: Received data", res);
        this.appointments = res || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Failed to load appointments", err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
