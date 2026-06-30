import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-wrapper">
      <div class="auth-background"></div>
      <div class="auth-container">
        <div class="glass-card auth-card">
          <div class="auth-header">
            <div class="brand-logo">🏥</div>
            <h1>Ai Healthcare <span>Chatbot</span></h1>
            <p>Your secure portal to advanced diagnostic care</p>
          </div>

          <div class="tabs">
            <button [class.active]="isLogin" (click)="isLogin = true">Login</button>
            <button [class.active]="!isLogin" (click)="isLogin = false">Register</button>
          </div>
          
          <div class="form-wrapper">
            <!-- Login Form -->
            <form *ngIf="isLogin" (ngSubmit)="onLogin()" class="auth-form animate-fade">
              <div class="form-group">
                <label>Email Address</label>
                <div class="input-wrapper">
                  <i class="icon">📧</i>
                  <input type="email" [(ngModel)]="loginData.email" name="lemail" required placeholder="name@hospital.com">
                </div>
              </div>
              <div class="form-group">
                <label>Password</label>
                <div class="input-wrapper">
                  <i class="icon">🔒</i>
                  <input type="password" [(ngModel)]="loginData.password" name="lpassword" required placeholder="••••••••">
                </div>
              </div>
              <div class="error-msg" *ngIf="errorMsg">{{errorMsg}}</div>
              <button type="submit" class="btn-primary w-100">Sign In</button>
              <p class="auth-footer">Forgot password? <a>Reset here</a></p>
            </form>

            <!-- Register Form -->
            <form *ngIf="!isLogin" (ngSubmit)="onRegister()" class="auth-form animate-fade">
              <div class="form-row">
                <div class="form-group">
                  <label>Full Name</label>
                  <input type="text" [(ngModel)]="registerData.name" name="rname" required placeholder="Dr. John Doe">
                </div>
              </div>
              <div class="form-group">
                <label>Email</label>
                <input type="email" [(ngModel)]="registerData.email" name="remail" required placeholder="email@example.com">
              </div>
              <div class="form-group">
                <label>Password</label>
                <input type="password" [(ngModel)]="registerData.password" name="rpassword" required placeholder="Min 8 characters">
              </div>
              <div class="form-group">
                <label>Role / Position</label>
                <select [(ngModel)]="registerData.role" name="rrole" class="form-control">
                  <option value="User">Patient / Regular User</option>
                  <option value="Doctor">Healthcare Professional (Doctor)</option>
                  <option value="Staff">Medical/Clinic Staff</option>
                </select>
              </div>

              <!-- Profile Image Upload for Doctors and Staff -->
              <div *ngIf="registerData.role === 'Doctor' || registerData.role === 'Staff'" class="form-group animate-slide">
                <label>Profile Image (Required for Professionals)</label>
                <div class="file-upload-wrapper">
                   <input type="file" (change)="onFileSelected($event)" accept="image/*" class="file-input" id="fileInput">
                   <label for="fileInput" class="file-label">
                     <span>{{ selectedFileName || 'Click to upload portrait...' }}</span>
                   </label>
                </div>
              </div>

              <div *ngIf="registerData.role === 'Doctor'" class="doctor-fields animate-slide">
                 <div class="form-group">
                    <label>Specialization</label>
                    <select [(ngModel)]="registerData.specialization" name="rspec" class="form-control">
                      <option value="" disabled selected>Select Specialty</option>
                      <option *ngFor="let spec of specializations" [value]="spec">{{spec}}</option>
                    </select>
                 </div>
                 <div class="form-group">
                    <label>Clinic/Hospital</label>
                    <input type="text" [(ngModel)]="registerData.location" name="rloc" placeholder="e.g. Sanctum Medical">
                 </div>
              </div>

              <div class="error-msg" *ngIf="errorMsg">{{errorMsg}}</div>
              <div class="success-msg" *ngIf="successMsg">{{successMsg}}</div>
              <button type="submit" class="btn-primary w-100">Create Account</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrapper {
      position: relative;
      min-height: 100vh;
      overflow: hidden;
      background: var(--bg-color);
    }
    .auth-background {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: url('https://images.unsplash.com/photo-1576091160550-21735999,11d2?auto=format&fit=crop&q=80&w=2000') center/cover no-repeat;
      opacity: 0.1;
      filter: grayscale(100%);
    }
    .auth-container {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 40px 20px;
      z-index: 1;
    }
    .auth-card {
      width: 100%;
      max-width: 480px;
      padding: 50px;
    }
    .auth-header {
      text-align: center;
      margin-bottom: 40px;
    }
    .brand-logo { font-size: 3rem; margin-bottom: 10px; }
    .auth-header h1 { font-size: 2.2rem; margin: 0; }
    .auth-header h1 span { color: var(--primary-color); }
    .auth-header p { color: var(--text-muted); font-size: 0.95rem; margin-top: 10px; }

    .tabs {
      display: flex;
      margin-bottom: 35px;
      gap: 10px;
      background: rgba(0,0,0,0.2);
      padding: 5px;
      border-radius: 12px;
    }
    .tabs button {
      flex: 1;
      background: transparent;
      border: none;
      color: var(--text-muted);
      padding: 12px;
      font-size: 1rem;
      cursor: pointer;
      font-weight: 600;
      border-radius: 8px;
      transition: 0.3s;
    }
    .tabs button.active {
      background: var(--surface-color);
      color: var(--primary-color);
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }

    .form-group { margin-bottom: 22px; }
    .form-group label {
      display: block;
      margin-bottom: 10px;
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--text-color);
    }
    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }
    .input-wrapper .icon {
      position: absolute;
      left: 15px;
      opacity: 0.5;
    }
    .input-wrapper input {
      padding-left: 45px;
    }

    input, select {
      width: 100%;
      padding: 14px 15px;
      background: rgba(255,255,255,0.03);
      border: 1.5px solid var(--border-color);
      color: white;
      border-radius: 10px;
      transition: all 0.3s;
      font-size: 1rem;
    }
    input:focus, select:focus {
      outline: none;
      border-color: var(--primary-color);
      background: rgba(33, 150, 243, 0.05);
      box-shadow: 0 0 0 4px rgba(33, 150, 243, 0.1);
    }

    .w-100 { width: 100%; font-size: 1.1rem; padding: 14px; margin-top: 15px; }

    .auth-footer {
      text-align: center;
      margin-top: 25px;
      font-size: 0.9rem;
      color: var(--text-muted);
    }
    .auth-footer a { color: var(--primary-color); cursor: pointer; font-weight: 600; }

    .doctor-fields {
      border-left: 2px solid var(--primary-color);
      padding-left: 20px;
      margin-top: 15px;
      background: rgba(33, 150, 243, 0.02);
      border-radius: 0 10px 10px 0;
    }

    .animate-fade { animation: fadeIn 0.4s ease-out; }
    .animate-slide { animation: slideRight 0.4s ease-out; }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideRight {
      from { opacity: 0; transform: translateX(-15px); }
      to { opacity: 1; transform: translateX(0); }
    }

    .error-msg, .success-msg {
      font-size: 0.9rem;
      margin-bottom: 20px;
      padding: 10px;
      border-radius: 8px;
      text-align: center;
    }
    .error-msg { background: rgba(255, 75, 75, 0.1); color: var(--error-color); }
    .success-msg { background: rgba(0, 230, 118, 0.1); color: var(--success-color); }

    .file-upload-wrapper {
      position: relative;
      width: 100%;
    }
    .file-input {
      display: none;
    }
    .file-label {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 14px;
      background: rgba(255,255,255,0.05);
      border: 1.5px dashed var(--border-color);
      border-radius: 10px;
      cursor: pointer;
      color: var(--text-muted);
      transition: 0.3s;
    }
    .file-label:hover {
      border-color: var(--primary-color);
      background: rgba(33, 150, 243, 0.05);
      color: white;
    }
  `]
})
export class LoginComponent {
  isLogin = true;
  loginData = { email: '', password: '' };
  registerData = { 
    name: '', 
    email: '', 
    password: '', 
    role: 'User',
    specialization: '',
    location: '',
    profileImage: ''
  };
  specializations = [
    'Physician', 'Cardiologist', 'Neurologist', 'Pediatrician', 'Dermatologist', 'Surgeon', 'Orthopedic', 'Psychiatrist'
  ];
  selectedFileName = '';
  errorMsg = '';
  successMsg = '';

  constructor(private authService: AuthService, private router: Router) {}

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        this.errorMsg = 'Image size should be less than 2MB.';
        return;
      }
      this.selectedFileName = file.name;
      const reader = new FileReader();
      reader.onload = () => {
        this.registerData.profileImage = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onLogin() {
    this.errorMsg = '';
    this.authService.login(this.loginData).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        
        // Redirect based on role
        if (res.user.role === 'Doctor') {
          window.location.href = '/doctor-dashboard';
        } else if (res.user.role === 'Staff') {
          window.location.href = '/staff-dashboard';
        } else {
          window.location.href = '/chat';
        }
      },
      error: (err) => {
        this.errorMsg = 'Invalid email or password.';
      }
    });
  }

  onRegister() {
    this.errorMsg = '';
    this.successMsg = '';
    this.authService.register(this.registerData).subscribe({
      next: (res) => {
        this.successMsg = 'Registration successful! You can now login.';
        this.isLogin = true;
      },
      error: (err) => {
        this.errorMsg = err.error || 'Registration failed.';
      }
    });
  }
}
