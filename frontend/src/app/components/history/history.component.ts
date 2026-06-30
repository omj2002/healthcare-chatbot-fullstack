import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ChatMessage } from '../../models/interfaces';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="history-page">
      <div class="history-header">
        <div class="container header-flex">
          <div>
            <h1 class="page-title">MedHistory Portal</h1>
            <p class="subtitle">Review your previous consultations and AI diagnostics</p>
          </div>
          <button class="btn-primary download-btn" (click)="downloadPDF()" *ngIf="!loading && history.length > 0">
            <span class="icon">📥</span> Download PDF Report
          </button>
        </div>
      </div>
      
      <div class="container">
        <div *ngIf="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Retrieving clinical records...</p>
        </div>
        
        <div *ngIf="!loading && history.length === 0" class="empty-state glass-card">
          <div class="icon">📁</div>
          <h3>No Records Found</h3>
          <p>You haven't had any AI consultations yet. Start chatting to see your history here.</p>
        </div>

        <div class="history-grid" *ngIf="!loading && history.length > 0">
          <div class="history-item glass-card" *ngFor="let item of history">
            <div class="history-meta">
              <span class="date-badge">{{ item.timestamp | date:'MMM dd, yyyy • h:mm a' }}</span>
              <span class="id-tag">REF #{{ item.id }}</span>
            </div>
            
            <div class="conversation-block">
              <div class="bubble user-bubble">
                <div class="bubble-header">You</div>
                <div class="bubble-text">{{ item.message || '...' }}</div>
              </div>
              
              <div class="bubble bot-bubble">
                <div class="bubble-header">HealthBot AI</div>
                <div class="bubble-text" [innerHTML]="formatReply(item.botReply)"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .history-page {
      min-height: 100vh;
      background: var(--bg-color);
      color: var(--text-color);
      padding-bottom: 60px;
    }
    .history-header {
      background: linear-gradient(135deg, rgba(33, 150, 243, 0.1), rgba(76, 175, 80, 0.1));
      padding: 60px 0;
      margin-bottom: 40px;
      border-bottom: 1px solid var(--glass-border);
    }
    .header-flex {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 20px;
    }
    .page-title {
      font-size: 2.8rem;
      font-weight: 800;
      margin: 0;
      background: linear-gradient(135deg, #00d2ff, #3a7bd5);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .subtitle { color: var(--text-muted); font-size: 1.1rem; margin-top: 10px; }
    
    .download-btn {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 25px;
      font-size: 1rem;
      box-shadow: 0 4px 15px rgba(0, 210, 255, 0.3);
    }

    .loading-state { text-align: center; padding: 100px 0; color: var(--text-muted); }
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(0, 210, 255, 0.1);
      border-top-color: var(--primary-color);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .empty-state {
      text-align: center;
      padding: 60px;
      max-width: 500px;
      margin: 0 auto;
    }
    .empty-state .icon { font-size: 4rem; margin-bottom: 20px; }
    .empty-state p { color: var(--text-muted); }

    .history-grid {
      display: flex;
      flex-direction: column;
      gap: 30px;
    }
    .history-item {
      padding: 30px;
    }
    .history-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 25px;
      padding-bottom: 15px;
      border-bottom: 1px solid var(--glass-border);
    }
    .date-badge {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--primary-color);
      background: rgba(0, 210, 255, 0.1);
      padding: 4px 12px;
      border-radius: 20px;
    }
    .id-tag { color: var(--text-muted); font-size: 0.75rem; font-family: monospace; }
    
    .conversation-block {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .bubble {
      padding: 15px 20px;
      border-radius: 12px;
      max-width: 90%;
      position: relative;
    }
    .bubble-header {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 8px;
    }
    .user-bubble {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.05);
      align-self: flex-start;
    }
    .user-bubble .bubble-header { color: var(--text-muted); }
    
    .bot-bubble {
      background: rgba(0, 210, 255, 0.05);
      border: 1px solid rgba(0, 210, 255, 0.1);
      align-self: flex-start;
    }
    .bot-bubble .bubble-header { color: var(--primary-color); }
    .bubble-text { line-height: 1.6; font-size: 0.95rem; }
  `]
})
export class HistoryComponent implements OnInit {
  history: any[] = [];
  loading = true;

  constructor(
    private apiService: ApiService, 
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.apiService.getChatHistory().subscribe({
      next: (data: any[]) => {
        console.log('History loaded raw:', data);
        // Map data to ensure camelCase even if backend sends PascalCase
        this.history = data.map(item => ({
          id: item.id || item.Id,
          userId: item.userId || item.UserId,
          message: item.message || item.Message || '',
          botReply: item.botReply || item.BotReply || '',
          timestamp: item.timestamp || item.Timestamp
        }));
        this.loading = false;
        this.cdr.detectChanges(); // Force UI update
      },
      error: (err) => {
        console.error('Error fetching history', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  formatReply(text: string): string {
    if (!text) return '...';
    // Format bold text **bold** -> <strong>bold</strong>
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\n/g, '<br>');
    return formatted;
  }

  downloadPDF() {
    const doc = new jsPDF();
    const user = this.authService.getUser();
    const date = new Date().toLocaleDateString();

    // Add Header
    doc.setFontSize(22);
    doc.setTextColor(33, 150, 243); // Primary color
    doc.text('HealthBot AI Medical Report', 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Patient Name: ${user?.name || 'Valued Patient'}`, 14, 32);
    doc.text(`Report Date: ${date}`, 14, 37);
    doc.text(`Total Records: ${this.history.length}`, 14, 42);

    // Draw a line
    doc.setDrawColor(200);
    doc.line(14, 48, 196, 48);

    // Prepare table data
    const tableData = this.history.map(item => [
      new Date(item.timestamp).toLocaleString(),
      item.message,
      item.botReply.replace(/\[ACTION:.*?\]/g, '').replace(/\*\*/g, '') // Clean markers
    ]);

    autoTable(doc, {
      startY: 55,
      head: [['Date & Time', 'Your Query', 'AI Guidance / Reply']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [33, 150, 243], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { top: 55 },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 50 },
        2: { cellWidth: 'auto' }
      }
    });

    doc.save(`MedHistory_${user?.name || 'Patient'}_${date.replace(/\//g, '-')}.pdf`);
  }
}


