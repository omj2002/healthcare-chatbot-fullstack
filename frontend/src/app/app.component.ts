import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';
import { ChatbotWidgetComponent } from './components/chatbot-widget/chatbot-widget.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule, ChatbotWidgetComponent],
  template: `
    <nav class="navbar">
      <div class="logo" routerLink="/">
        <span>🏥 Ai Healthcare</span> Chatbot
      </div>
      <div class="nav-links">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Home</a>
        
        <!-- Main Navigation -->
        <a routerLink="/chat" routerLinkActive="active">Chatbot</a>
        
        <!-- Role-Specific Links -->
        <!-- Chatbot is now a widget, but patients can still access the full page if they want, or we can hide it -->
        <a *ngIf="isLoggedIn() && getRole() === 'User'" routerLink="/appointments" routerLinkActive="active">My Appointments</a>
        <a *ngIf="isLoggedIn() && getRole() === 'Doctor'" routerLink="/doctor-dashboard" routerLinkActive="active">Doctor Panel</a>
        <a *ngIf="isLoggedIn() && getRole() === 'Staff'" routerLink="/staff-dashboard" routerLinkActive="active">Staff Panel</a>
        
        <a *ngIf="isLoggedIn()" routerLink="/history" routerLinkActive="active">History</a>
        <a *ngIf="!isLoggedIn()" routerLink="/login" class="btn-primary login-btn">Login / Register</a>
        <button *ngIf="isLoggedIn()" (click)="logout()" class="btn-outline logout-btn">Logout</button>
      </div>
    </nav>

    <main class="main-content">
      <router-outlet></router-outlet>
    </main>

    <!-- Global Chatbot Widget -->
    <app-chatbot-widget *ngIf="shouldShowWidget()"></app-chatbot-widget>

    <div class="global-disclaimer" *ngIf="!isHomePage()">
       <p>⚠️ Disclaimer: This is an AI-powered assistant for general guidance only.</p>
    </div>
  `,
  styles: [`
    .navbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 18px 8%;
      background: var(--glass-bg);
      backdrop-filter: blur(15px);
      -webkit-backdrop-filter: blur(15px);
      border-bottom: 1px solid var(--glass-border);
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
    }
    .logo {
      font-size: 1.6rem;
      font-weight: 800;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 10px;
      color: white;
      transition: 0.3s;
    }
    .logo span {
       background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
       -webkit-background-clip: text;
       -webkit-text-fill-color: transparent;
    }
    .logo:hover { opacity: 0.8; }
    
    .nav-links { display: flex; align-items: center; gap: 35px; }
    .nav-links a {
      color: var(--text-muted);
      text-decoration: none;
      font-weight: 600;
      transition: 0.3s;
      font-size: 0.95rem;
      position: relative;
    }
    .nav-links a:hover, .nav-links a.active {
      color: var(--primary-color);
    }
    .nav-links a::after {
      content: '';
      position: absolute;
      bottom: -5px; left: 0; width: 0; height: 2px;
      background: var(--primary-color);
      transition: 0.3s;
    }
    .nav-links a.active::after { width: 100%; }

    .login-btn {
      background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
      color: white !important;
      padding: 10px 25px !important;
      border-radius: 10px !important;
      box-shadow: 0 4px 15px rgba(33, 150, 243, 0.4);
      margin-left: 10px !important;
    }
    .login-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(33, 150, 243, 0.5); }
    
    .logout-btn {
      padding: 8px 18px;
      border: 1.5px solid var(--border-color);
      background: transparent;
      color: var(--text-color);
      border-radius: 10px;
      cursor: pointer;
      font-weight: 600;
      transition: 0.3s;
    }
    .logout-btn:hover { border-color: var(--error-color); color: var(--error-color); }

    .main-content { min-height: 100vh; }
    
    .global-disclaimer {
      text-align: center;
      padding: 12px;
      background: rgba(255, 193, 7, 0.05);
      color: #ffc107;
      font-size: 0.85rem;
      border-top: 1px solid rgba(255, 193, 7, 0.1);
    }
  `]
})
export class AppComponent {
  constructor(private authService: AuthService) {}

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  getRole(): string {
    return this.authService.getUserRole();
  }

  isHomePage(): boolean {
    return window.location.pathname === '/';
  }

  shouldShowWidget(): boolean {
    // Show for all users (Patients, Doctors, Staff)
    return true;
  }

  logout() {
    this.authService.logout();
    window.location.href = '/login';
  }
}

