import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Doctor } from '../../models/interfaces';

@Component({
  selector: 'app-doctor-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="profile-container" *ngIf="doctor && !isLoading">
      <div class="profile-header">
        <button class="back-btn" (click)="goBack()">← Back to Chat</button>
        <h2>Specialist Profile</h2>
      </div>
      
      <div class="profile-card">
        <div class="doc-image-placeholder">
          <span>👨‍⚕️</span>
        </div>
        <div class="doc-info">
          <h1>{{doctor.name}}</h1>
          <h3 class="specialization">{{doctor.specialization}}</h3>
          <p class="location">📍 {{doctor.location}}</p>
          
          <div class="bio">
            <h4>About the Doctor</h4>
            <p>{{doctor.name}} is a highly experienced {{doctor.specialization}} practicing at {{doctor.location}}. They specialize in comprehensive medical evaluations, advanced diagnostics, and dedicated patient care. They are currently available for consultation.</p>
          </div>
          
          <div class="availability-badge" [ngClass]="{'available': doctor.available, 'unavailable': !doctor.available}">
            {{doctor.available ? '● Accepting New Patients' : '○ Currently Unavailable'}}
          </div>
        </div>
      </div>
      
      <div class="booking-section">
        <h3>Schedule Consultation</h3>
        <p>Book an appointment to discuss your symptoms and receive a certified medical diagnosis.</p>
        
        <button class="book-btn" (click)="showForm = true" *ngIf="!showForm" [disabled]="!doctor.available">
          Request Appointment
        </button>

        <div class="booking-form" *ngIf="showForm">
          <div class="form-group">
            <label>Select Date</label>
            <input type="date" [(ngModel)]="apptDate" [min]="todayDate">
          </div>
          <div class="form-group">
            <label>Select Time</label>
            <input type="time" [(ngModel)]="apptTime">
          </div>
          <div class="form-group">
            <label>Reason for Visit</label>
            <textarea [(ngModel)]="apptReason" placeholder="Briefly describe your symptoms or reason..."></textarea>
          </div>
          
          <div class="form-actions">
            <button class="cancel-btn" (click)="showForm = false">Cancel</button>
            <button class="book-btn confirm" (click)="bookAppt()" [disabled]="!isFormValid() || isBooking">
              {{isBooking ? 'Booking...' : 'Confirm Appointment'}}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="loading" *ngIf="isLoading && !error">Loading profile (ID: {{currentId}})...</div>
    <div class="error" *ngIf="error">{{error}}</div>
    
    <!-- DEBUG VIEW -->
    <pre style="padding: 10px; background: #000; color: #0f0; margin: 20px;" *ngIf="!doctor && !isLoading && !error">
      No data rendered. Doctor: {{ doctor | json }}
    </pre>


  `,
  styles: [`
    .profile-container {
      max-width: 800px;
      margin: 20px auto;
      background: var(--surface-color);
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.4);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      min-height: calc(100vh - 180px);
    }
    .profile-header {
      background: linear-gradient(135deg, var(--secondary-color), var(--primary-color));
      padding: 20px 25px;
      color: white;
      display: flex;
      align-items: center;
      gap: 20px;
    }
    .back-btn {
      background: rgba(255,255,255,0.2);
      border: none;
      color: white;
      padding: 8px 15px;
      border-radius: 20px;
      cursor: pointer;
      font-weight: bold;
      transition: background 0.2s;
    }
    .back-btn:hover { background: rgba(255,255,255,0.3); }
    .profile-card {
      display: flex;
      padding: 40px;
      gap: 40px;
      align-items: flex-start;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    .doc-image-placeholder {
      width: 150px;
      height: 150px;
      background: linear-gradient(135deg, #2c3e50, #3498db);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 5rem;
      flex-shrink: 0;
      box-shadow: 0 10px 20px rgba(0,0,0,0.2);
    }
    .doc-info h1 { margin: 0 0 5px 0; font-size: 2.2rem; color: var(--primary-color); }
    .specialization { margin: 0 0 15px 0; color: #a0aec0; font-weight: normal; font-size: 1.2rem; }
    .location { font-size: 1rem; margin-bottom: 20px; }
    .bio { background: rgba(0,0,0,0.2); padding: 20px; border-radius: 12px; margin-bottom: 20px; }
    .bio h4 { margin: 0 0 10px 0; color: var(--primary-color); }
    .availability-badge {
      display: inline-block;
      padding: 8px 15px;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: bold;
    }
    .available { background: rgba(46, 204, 113, 0.1); color: #2ecc71; border: 1px solid rgba(46, 204, 113, 0.3); }
    .unavailable { background: rgba(231, 76, 60, 0.1); color: #e74c3c; border: 1px solid rgba(231, 76, 60, 0.3); }
    .booking-section {
      padding: 40px;
      text-align: center;
      flex: 1;
    }
    .book-btn {
      background: linear-gradient(135deg, #f39c12, #e67e22);
      color: white;
      border: none;
      padding: 15px 40px;
      font-size: 1.2rem;
      font-weight: bold;
      border-radius: 30px;
      cursor: pointer;
      margin-top: 20px;
      box-shadow: 0 5px 15px rgba(230, 126, 34, 0.3);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .book-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(230, 126, 34, 0.4);
    }
    .book-btn:disabled {
      background: #7f8c8d;
      cursor: not-allowed;
      box-shadow: none;
    }
    
    .booking-form {
      margin-top: 30px;
      text-align: left;
      background: rgba(0,0,0,0.2);
      padding: 25px;
      border-radius: 12px;
    }
    .form-group { margin-bottom: 20px; }
    .form-group label { display: block; margin-bottom: 8px; color: #a0aec0; }
    .form-group input, .form-group textarea {
      width: 100%; padding: 12px; border-radius: 8px;
      border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05);
      color: var(--text-color); font-family: inherit; font-size: 1rem; box-sizing: border-box;
    }
    .form-group textarea { resize: vertical; min-height: 80px; }
    .form-actions { display: flex; gap: 15px; justify-content: flex-end; margin-top: 25px; }
    .cancel-btn { background: transparent; border: 1px solid rgba(255,255,255,0.2); color: white; padding: 10px 25px; border-radius: 30px; cursor: pointer; }
    .cancel-btn:hover { background: rgba(255,255,255,0.1); }
    .book-btn.confirm { margin-top: 0; padding: 12px 30px; font-size: 1.1rem; }
    
    .loading, .error { padding: 40px; text-align: center; font-size: 1.2rem; }
    .error { color: #e74c3c; }
  `]
})
export class DoctorProfileComponent implements OnInit {
  doctor: Doctor | null = null;
  error = '';
  isBooking = false;
  showForm = false;
  isLoading = true;
  currentId: string | null = null;
  
  apptDate = '';
  apptTime = '';
  apptReason = '';
  todayDate = new Date().toISOString().split('T')[0];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.currentId = idParam;
    console.log("DoctorProfileComponent: Loading for ID", idParam);
    if (idParam) {
      this.isLoading = true;
      this.apiService.getDoctor(+idParam).subscribe({
        next: (doc) => {
          console.log("DoctorProfileComponent: Received doctor data", doc);
          this.doctor = doc;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error("DoctorProfileComponent: API Error", err);
          this.error = "Failed to load doctor profile. They might be unavailable.";
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.isLoading = false;
    }
  }

  goBack(): void {
    this.router.navigate(['/chat']);
  }

  isFormValid(): boolean {
    return !!this.apptDate && !!this.apptTime && !!this.apptReason.trim();
  }

  bookAppt(): void {
    if (!this.doctor || !this.isFormValid()) return;
    this.isBooking = true;
    
    // Combine date and time
    const localDate = new Date(`${this.apptDate}T${this.apptTime}:00`);
    const combinedDateTime = localDate.toISOString();
    
    this.apiService.bookAppointment(this.doctor.id, combinedDateTime).subscribe({
      next: () => {
        alert('Appointment successfully scheduled!');
        this.isBooking = false;
        this.router.navigate(['/appointments']);
      },
      error: () => {
        alert('Failed to book appointment. Please try again.');
        this.isBooking = false;
      }
    });
  }
}
