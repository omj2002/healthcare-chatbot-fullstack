import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-staff-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <header class="dash-header">
        <h1>🏢 Clinic Staff Management</h1>
        <p>Monitor clinic operations, manage doctors, and view patient records</p>
      </header>

      <div class="stats-grid" *ngIf="stats">
        <div class="stat-card">
          <span class="label">Active Doctors</span>
          <span class="value">{{stats.totalDoctors}}</span>
        </div>
        <div class="stat-card">
          <span class="label">Total Patients</span>
          <span class="value">{{stats.totalPatients}}</span>
        </div>
        <div class="stat-card">
          <span class="label">Open Appointments</span>
          <span class="value">{{stats.pendingAppointments}}</span>
        </div>
      </div>

      <div class="management-grid">
        <section class="doctors-section card">
          <div class="section-header">
             <h2>Registered Doctors</h2>
          </div>
          <ul class="item-list">
            <li *ngFor="let doc of doctors; let i = index">
              <div class="doc-entry">
                <div class="doc-thumb">
                  <img [src]="doc.profileImage || 'assets/doctor_male_2.png'" alt="Doctor">
                </div>
                <div class="info">
                  <strong>#{{doc.id}} {{doc.name}}</strong>
                  <span>{{doc.specialization}} - {{doc.location}}</span>
                </div>
              </div>
              <button class="icon-btn deactivate" title="Deactivate Doctor" (click)="deactivateDoctor(doc.id)">🚫</button>
            </li>
          </ul>
        </section>

        <section class="patients-section card">
          <h2>Recent Patients</h2>
          <ul class="item-list">
            <li *ngFor="let p of patients">
              <div class="info clickable" (click)="viewPatient(p)">
                <strong>#{{p.id}} {{p.name}}</strong>
                <span>{{p.email}}</span>
                <span class="role-badge">View Records</span>
              </div>
              <button class="icon-btn deactivate" title="Deactivate Patient" (click)="deactivatePatient(p.id)">🚫</button>
            </li>
          </ul>
        </section>
      </div>

      <!-- Patient Detail Modal (Simple Overlay) -->
      <div class="modal" *ngIf="selectedPatient">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Diagnostic Records: {{selectedPatient.name}}</h3>
            <button class="close-btn" (click)="selectedPatient = null">×</button>
          </div>
          <div class="records-list">
             <div class="record-item" *ngFor="let rec of patientRecords">
                <div class="rec-head">
                   <span class="disease">{{rec.disease}}</span>
                   <span class="date">{{rec.timestamp | date:'short'}}</span>
                </div>
                <p><strong>Symptoms:</strong> {{rec.symptoms}}</p>
                <div *ngIf="rec.severity" class="severity-tag" [ngClass]="rec.severity.toLowerCase()">{{rec.severity}} Severity</div>
             </div>
             <p *ngIf="patientRecords.length === 0" class="empty-msg">No medical records found for this patient.</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container { padding: 40px; max-width: 1400px; margin: 0 auto; }
    .dash-header { margin-bottom: 40px; }
    .dash-header h1 { margin: 0; font-size: 2.2rem; color: var(--primary-color); }
    
    .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 40px; }
    .stat-card { background: var(--surface-color); padding: 25px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); }
    .stat-card .label { display: block; color: var(--text-muted); margin-bottom: 5px; font-size: 0.8rem; }
    .stat-card .value { font-size: 1.8rem; font-weight: bold; color: var(--primary-color); }

    .management-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
    .card { background: var(--surface-color); padding: 30px; border-radius: 16px; min-height: 400px; border: 1px solid rgba(255,255,255,0.05); }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    
    .item-list { list-style: none; padding: 0; margin: 0; }
    .item-list li { display: flex; justify-content: space-between; align-items: center; padding: 15px; border-bottom: 1px solid rgba(255,255,255,0.05); }
    .item-list li:last-child { border-bottom: none; }
    .item-list li.clickable:hover { background: rgba(255,255,255,0.02); cursor: pointer; }
    
    .info strong { display: block; font-size: 1.1rem; }
    .info span { font-size: 0.85rem; color: var(--text-muted); }

    .doc-entry { display: flex; align-items: center; gap: 15px; }
    .doc-thumb { width: 40px; height: 40px; border-radius: 50%; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); flex-shrink: 0; }
    .doc-thumb img { width: 100%; height: 100%; object-fit: cover; }
    
    .icon-btn { background: none; border: none; font-size: 1.2rem; cursor: pointer; filter: grayscale(1); transition: 0.2s; }
    .icon-btn:hover { filter: grayscale(0); transform: scale(1.2); }
    .role-badge { font-size: 0.75rem; color: var(--primary-color); border: 1px solid var(--primary-color); padding: 2px 8px; border-radius: 4px; display: inline-block; margin-top: 5px; }

    .icon-btn.deactivate:hover { filter: none !important; }

    /* Modal Styles */
    .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; justify-content: center; align-items: center; z-index: 1000; }
    .modal-content { background: var(--surface-color); width: 80%; max-width: 600px; border-radius: 20px; padding: 30px; max-height: 80vh; overflow-y: auto; position: relative; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 15px; }
    .close-btn { background: none; border: none; font-size: 2rem; color: white; cursor: pointer; }
    
    .record-item { background: rgba(0,0,0,0.2); border-radius: 10px; padding: 15px; margin-bottom: 15px; }
    .rec-head { display: flex; justify-content: space-between; margin-bottom: 10px; }
    .disease { font-weight: bold; color: var(--primary-color); font-size: 1.1rem; }
    .date { font-size: 0.8rem; color: var(--text-muted); }
    .severity-tag { display: inline-block; font-size: 0.7rem; padding: 2px 8px; border-radius: 4px; text-transform: uppercase; font-weight: bold; margin-top: 10px; }
    .severity-tag.high { background: #c0392b; color: white; }
    .severity-tag.medium { background: #f39c12; color: white; }
    .severity-tag.low { background: #27ae60; color: white; }
    .empty-msg { text-align: center; color: var(--text-muted); padding: 20px; }
  `]
})
export class StaffDashboardComponent implements OnInit {
  stats: any;
  doctors: any[] = [];
  patients: any[] = [];
  selectedPatient: any = null;
  patientRecords: any[] = [];

  constructor(private apiService: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.apiService.getStaffStats().subscribe({
      next: (s) => { 
        this.stats = s; 
        this.cdr.detectChanges(); 
      },
      error: (err) => console.error("Stats fail", err)
    });
    
    this.apiService.getDoctors().subscribe({
      next: (d) => { 
        this.doctors = d; 
        this.cdr.detectChanges(); 
      },
      error: (err) => console.error("Docs fail", err)
    });
    
    this.apiService.getStaffPatients().subscribe({
      next: (p) => { 
        this.patients = p; 
        this.cdr.detectChanges(); 
      },
      error: (err) => console.error("Patients fail", err)
    });
  }

  deactivateDoctor(id: number) {
    if (confirm("Are you sure you want to deactivate this doctor? They will no longer be visible in the system.")) {
      this.apiService.deactivateDoctor(id).subscribe({
        next: () => this.loadData(),
        error: (err) => alert("Failed to deactivate doctor")
      });
    }
  }

  deactivatePatient(id: number) {
    if (confirm("Are you sure you want to deactivate this patient account?")) {
      this.apiService.deactivatePatient(id).subscribe({
        next: () => this.loadData(),
        error: (err) => alert("Failed to deactivate patient")
      });
    }
  }

  viewPatient(p: any) {
    this.selectedPatient = p;
    this.apiService.getPatientRecords(p.id).subscribe(r => {
      this.patientRecords = r;
      this.cdr.detectChanges();
    });
  }
}
