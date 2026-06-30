import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { Doctor } from '../../models/interfaces';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="home-wrapper">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-content">
          <span class="badge">Trusted Healthcare Excellence</span>
          <h1>Advanced Care for <span>Your Health</span></h1>
          <p class="subtitle">Experience world-class medical services combined with AI-powered diagnostic excellence.</p>
          <div class="cta-group">
            <button class="btn-primary-large" (click)="getStarted()">Book Consultation</button>
            <button class="btn-outline-large" (click)="scrollTo('services')">Our Services</button>
          </div>
          
          <div class="stats-row">
            <div class="stat-item">
              <span class="stat-num">150+</span>
              <span class="stat-label">Specialists</span>
            </div>
            <div class="stat-item">
              <span class="stat-num">10k+</span>
              <span class="stat-label">Happy Patients</span>
            </div>
            <div class="stat-item">
              <span class="stat-num">24/7</span>
              <span class="stat-label">Emergency Care</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Services Section -->
      <section id="services" class="services-section">
        <h2 class="section-title">Specialized Departments</h2>
        <div class="services-grid">
          <div class="service-card glass-card">
            <div class="icon">🫀</div>
            <h3>Cardiology</h3>
            <p>Comprehensive heart care including diagnostics, surgery, and rehabilitation.</p>
          </div>
          <div class="service-card glass-card">
            <div class="icon">🧠</div>
            <h3>Neurology</h3>
            <p>Expert treatment for complex brain, spinal cord, and nervous system disorders.</p>
          </div>
          <div class="service-card glass-card">
            <div class="icon">🦴</div>
            <h3>Orthopedics</h3>
            <p>Advanced joint replacements, sports medicine, and bone health management.</p>
          </div>
          <div class="service-card glass-card">
            <div class="icon">👶</div>
            <h3>Pediatrics</h3>
            <p>Compassionate healthcare for children from infancy through adolescence.</p>
          </div>
          <div class="service-card glass-card">
            <div class="icon">🧴</div>
            <h3>Dermatology</h3>
            <p>Specialized care for skin, hair, and nail conditions using modern tech.</p>
          </div>
          <div class="service-card glass-card">
            <div class="icon">🔬</div>
            <h3>Diagnostics</h3>
            <p>State-of-the-art laboratory and imaging services for accurate results.</p>
          </div>
        </div>
      </section>

      <!-- Doctors Section -->
      <section id="doctors" class="doctors-section">
        <div class="container">
          <h2 class="section-title">Our <span>Specialist Doctors</span></h2>
          <div class="doctors-grid">
            <div *ngFor="let doctor of doctors; let i = index" class="doctor-card glass-card">
              <div class="doctor-image">
                <img [src]="getDoctorImage(doctor, i)" [alt]="doctor.name">
                <div class="availability" [class.available]="doctor.available">
                  {{ doctor.available ? '● Available' : '○ Offline' }}
                </div>
              </div>
              <div class="doctor-info">
                <h3>{{ doctor.name }}</h3>
                <span class="specialization">{{ doctor.specialization }}</span>
                <p class="location-text"><i class="icon-loc">📍</i> {{ doctor.location }}</p>
                <button class="btn-book" (click)="bookDoctor(doctor)">Book Appointment</button>
              </div>
            </div>
          </div>
          <div class="view-all" *ngIf="doctors.length > 4">
             <button class="btn-outline" (click)="searchByCategory('Physician')">View All Specialists</button>
          </div>
        </div>
      </section>

      <!-- Doctor Categories Section -->
      <section class="doctor-categories">
        <div class="container mobile-padding">
          <div class="cat-header">
            <h2 class="section-title">Explore by <span>Specialty</span></h2>
            <p>Direct access to world-class specialists across all major medical disciplines.</p>
          </div>
          
          <div class="categories-grid">
            <div class="cat-card glass-card" (click)="searchByCategory('Physician')">
              <div class="cat-icon">👨‍⚕️</div>
              <h3>Physicians</h3>
              <span>Primary Care</span>
            </div>
            <div class="cat-card glass-card" (click)="searchByCategory('Surgeon')">
              <div class="cat-icon">🔪</div>
              <h3>Surgeons</h3>
              <span>Specialized Surgery</span>
            </div>
            <div class="cat-card glass-card" (click)="searchByCategory('Radiologist')">
              <div class="cat-icon">🩻</div>
              <h3>Radiologists</h3>
              <span>Imaging Experts</span>
            </div>
            <div class="cat-card glass-card" (click)="searchByCategory('Oncologist')">
              <div class="cat-icon">🎗️</div>
              <h3>Oncologists</h3>
              <span>Cancer Care</span>
            </div>
            <div class="cat-card glass-card" (click)="searchByCategory('Psychiatrist')">
              <div class="cat-icon">🧠</div>
              <h3>Psychiatrists</h3>
              <span>Mental Health</span>
            </div>
            <div class="cat-card glass-card" (click)="searchByCategory('Gynecologist')">
              <div class="cat-icon">🤰</div>
              <h3>Gynecologists</h3>
              <span>Women's Health</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="footer">
        <div class="footer-grid">
          <div class="footer-brand">
            <h3>Ai Healthcare Chatbot</h3>
            <p>Leading the future of healthcare with artificial intelligence and compassionate care.</p>
          </div>
          <div class="footer-links">
            <h4>Quick Links</h4>
            <ul>
              <li><a (click)="scrollTo('services')">Services</a></li>
              <li><a routerLink="/login">Log In / Sign Up</a></li>
              <li><a routerLink="/chat">Symptom Checker</a></li>
            </ul>
          </div>
          <div class="footer-links">
            <h4>Contact Us</h4>
            <ul>
              <li>Sanctum Medical Center, Block 42</li>
              <li>Emergency: +1 (555) 911-000</li>
              <li>Email: contact@aihealthcarechatbot.com</li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2026 Ai Healthcare Chatbot Hospital Portal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .home-wrapper { overflow-x: hidden; }
    
    .hero-section {
      height: 95vh;
      background: radial-gradient(circle at top right, rgba(33, 150, 243, 0.15), transparent 40%),
                  radial-gradient(circle at bottom left, rgba(0, 210, 255, 0.1), transparent 40%),
                  var(--bg-color);
      display: flex;
      align-items: center;
      padding: 0 10%;
      position: relative;
    }

    .hero-section::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=2000') center/cover no-repeat;
      opacity: 0.15;
      z-index: 0;
    }

    .hero-content { max-width: 800px; position: relative; z-index: 1; }
    
    .badge {
      background: rgba(33, 150, 243, 0.15);
      color: var(--primary-color);
      padding: 8px 18px;
      border-radius: 30px;
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin-bottom: 25px;
      display: inline-block;
      border: 1px solid rgba(33, 150, 243, 0.3);
    }

    h1 { font-size: 4.5rem; margin-bottom: 25px; font-weight: 800; line-height: 1.1; }
    h1 span { color: var(--primary-color); }
    .subtitle { font-size: 1.3rem; color: var(--text-muted); margin-bottom: 45px; max-width: 600px; }

    .cta-group { display: flex; gap: 20px; margin-bottom: 60px; }
    .btn-primary-large {
      padding: 16px 40px; background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); border: none;
      color: white; border-radius: 12px; font-weight: 700; font-size: 1.1rem; cursor: pointer;
      box-shadow: 0 8px 20px rgba(33, 150, 243, 0.3); transition: 0.3s;
    }
    .btn-primary-large:hover { transform: translateY(-3px); box-shadow: 0 12px 25px rgba(33, 150, 243, 0.4); }
    
    .btn-outline-large {
      padding: 16px 40px; background: transparent; border: 2px solid var(--primary-color);
      color: var(--primary-color); border-radius: 12px; font-weight: 700; font-size: 1.1rem; cursor: pointer;
      transition: 0.3s;
    }
    .btn-outline-large:hover { background: rgba(33, 150, 243, 0.05); }

    .stats-row { display: flex; gap: 50px; }
    .stat-item { display: flex; flex-direction: column; }
    .stat-num { font-size: 2.8rem; font-weight: 800; color: white; }
    .stat-label { color: var(--text-muted); font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; }

    .services-section { padding: 120px 10%; background: var(--bg-color); }
    .services-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 35px;
    }
    .service-card .icon { font-size: 3.5rem; margin-bottom: 25px; }
    .service-card h3 { margin-bottom: 15px; color: white; font-size: 1.5rem; }
    .service-card p { color: var(--text-muted); line-height: 1.7; font-size: 1rem; }

    /* Doctors Section Styles */
    .doctors-section { padding: 100px 5%; background: var(--surface-color); }
    .doctors-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 30px;
      margin-bottom: 50px;
    }
    .doctor-card {
      padding: 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .doctor-image {
      height: 280px;
      position: relative;
      overflow: hidden;
    }
    .doctor-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
    }
    .doctor-card:hover .doctor-image img { transform: scale(1.05); }
    .availability {
      position: absolute;
      top: 15px; right: 15px;
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 0.75rem;
      background: rgba(0,0,0,0.6);
      backdrop-filter: blur(5px);
      color: #ff4b4b;
    }
    .availability.available { color: #00e676; }

    .doctor-info { padding: 25px; flex: 1; display: flex; flex-direction: column; }
    .doctor-info h3 { margin: 0 0 5px; font-size: 1.3rem; }
    .specialization { color: var(--primary-color); font-weight: 600; display: block; margin-bottom: 15px; }
    .location-text { font-size: 0.9rem; color: var(--text-muted); margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }
    .btn-book {
      margin-top: auto;
      padding: 12px; background: rgba(255,255,255,0.05); border: 1px solid var(--border-color);
      color: white; border-radius: 8px; cursor: pointer; font-weight: 600; transition: 0.3s;
    }
    .btn-book:hover { background: var(--primary-color); border-color: var(--primary-color); }

    .view-all { text-align: center; }

    .doctor-categories { padding: 120px 0; background: var(--bg-color); }
    .cat-header { text-align: center; margin-bottom: 60px; padding: 0 10%; }
    .cat-header h2 { margin-bottom: 15px; }
    .cat-header p { color: var(--text-muted); max-width: 600px; margin: 0 auto; }
    
    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 25px;
      padding: 0 10%;
    }
    .cat-card {
      text-align: center;
      padding: 40px 20px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .cat-icon { font-size: 2.5rem; margin-bottom: 20px; filter: grayscale(0.5); transition: 0.3s; }
    .cat-card h3 { margin: 0 0 5px; font-size: 1.2rem; color: white; }
    .cat-card span { font-size: 0.85rem; color: var(--text-muted); }
    
    .cat-card:hover .cat-icon { transform: scale(1.2); filter: grayscale(0); }
    .cat-card:hover h3 { color: var(--primary-color); }

    .mobile-padding { padding: 0 5%; }

    @media (max-width: 900px) {
      .hero-section { text-align: center; justify-content: center; }
      .cta-group { justify-content: center; }
      .stats-row { justify-content: center; }
      .categories-container { flex-direction: column; text-align: center; }
      .categories-list { justify-content: center; }
      h1 { font-size: 3rem; }
    }
  `]
})
export class HomeComponent implements OnInit {
  doctors: Doctor[] = [
    { id: 1, name: 'Dr. Sarah Mitchell', specialization: 'Senior Cardiologist', location: 'Sanctum Medical Center', available: true },
    { id: 2, name: 'Dr. James Wilson', specialization: 'Neurology Specialist', location: 'West Wing Clinic', available: true },
    { id: 3, name: 'Dr. Elena Rodriguez', specialization: 'Pediatrician', location: 'Childrens Health Hub', available: false },
    { id: 4, name: 'Dr. Michael Chen', specialization: 'Dermatologist', location: 'City Skin Institute', available: true }
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    // Attempt to fetch real data, but we already have mock data as initial state
    this.apiService.getDoctors().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.doctors = data.slice(0, 4);
        }
      },
      error: (err) => {
        console.error('Error fetching doctors:', err);
        // Keep mock data or reload it if needed
      }
    });
  }

  loadMockDoctors() {
    this.doctors = [
      { id: 1, name: 'Dr. Sarah Mitchell', specialization: 'Senior Cardiologist', location: 'Sanctum Medical Center', available: true },
      { id: 2, name: 'Dr. James Wilson', specialization: 'Neurology Specialist', location: 'West Wing Clinic', available: true },
      { id: 3, name: 'Dr. Elena Rodriguez', specialization: 'Pediatrician', location: 'Childrens Health Hub', available: false },
      { id: 4, name: 'Dr. Michael Chen', specialization: 'Dermatologist', location: 'City Skin Institute', available: true }
    ];
  }
  
  getDoctorImage(doctor: Doctor, index: number): string {
    if (doctor.profileImage) {
      return doctor.profileImage;
    }
    const fallbackImages = [
      'assets/doctor_male_1.png',
      'assets/doctor_female_1.png',
      'assets/doctor_male_2.png',
      'assets/doctor_female_2.png'
    ];
    return fallbackImages[index % fallbackImages.length];
  }

  bookDoctor(doctor: Doctor) {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/chat'], { queryParams: { intent: 'doctor', q: doctor.name } });
    } else {
      this.router.navigate(['/login']);
    }
  }

  getStarted() {
    if (this.authService.isLoggedIn()) {
      const role = this.authService.getUserRole();
      if (role === 'Doctor') {
        this.router.navigate(['/doctor-dashboard']);
      } else if (role === 'Staff') {
        this.router.navigate(['/staff-dashboard']);
      } else {
        this.router.navigate(['/chat']);
      }
    } else {
      this.router.navigate(['/login']);
    }
  }

  scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  searchByCategory(category: string) {
    if (this.authService.isLoggedIn()) {
      // Navigate to chat with category intent
      this.router.navigate(['/chat'], { queryParams: { intent: 'doctor', q: category } });
    } else {
      this.router.navigate(['/login']);
    }
  }
}

