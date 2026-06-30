import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatbotComponent } from '../chatbot/chatbot.component';

@Component({
  selector: 'app-chatbot-widget',
  standalone: true,
  imports: [CommonModule, ChatbotComponent],
  template: `
    <div class="chatbot-widget-wrapper">
      <!-- Floating Button -->
      <button class="chatbot-widget-btn" (click)="toggleChat()">
        <span *ngIf="!isOpen">💬</span>
        <span *ngIf="isOpen">✖</span>
      </button>

      <!-- Chat Container -->
      <div class="chatbot-container-overlay" [class.active]="isOpen">
        <div class="widget-header">
          <div class="header-info">
            <span class="dot"></span>
            <h4>HealthBot AI Assistant</h4>
          </div>
        </div>
        <div class="widget-body">
          <app-chatbot [isWidget]="true"></app-chatbot>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chatbot-widget-wrapper { position: relative; }
    
    .widget-header {
      background: var(--primary-color);
      color: white;
      padding: 15px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .header-info { display: flex; align-items: center; gap: 10px; }
    .dot { width: 10px; height: 10px; background: #4caf50; border-radius: 50%; box-shadow: 0 0 10px #4caf50; }
    .header-info h4 { margin: 0; font-size: 1rem; }

    .widget-body {
      flex: 1;
      background: var(--bg-color);
      display: flex;
      flex-direction: column;
      min-height: 0;
    }
    
    app-chatbot {
      height: 100%;
      display: flex;
      flex-direction: column;
    }
  `]
})
export class ChatbotWidgetComponent {
  isOpen = false;

  toggleChat() {
    this.isOpen = !this.isOpen;
  }
}
