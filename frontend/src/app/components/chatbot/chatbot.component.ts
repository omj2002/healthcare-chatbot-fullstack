import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked, ChangeDetectorRef, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ChatMessage, Doctor } from '../../models/interfaces';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chat-container" [class.widget-mode]="isWidget">
      <div class="chat-header" *ngIf="!isWidget">
        HealthBot Assistant
        <span class="mode-badge" *ngIf="contextMode !== 'General'">Mode: {{contextMode}}</span>
      </div>
      
      <div class="chat-window" #scrollMe>
        <div class="welcome-message" *ngIf="messages.length === 0">
          <div class="bot-avatar">🤖</div>
          <p>Hello! 👋 I am your advanced AI Health Assistant.<br>Ask me anything about diseases, cures, or tell me your symptoms!</p>
        </div>

        <div *ngFor="let msg of messages" class="message-wrapper" [ngClass]="msg.isUser ? 'user' : 'bot'">
          <div class="avatar" *ngIf="!msg.isUser">🤖</div>
          <div class="message-content">
            <p [innerHTML]="formatReply(msg.displayedText || msg.text)"></p>
            
            <!-- Quick Options if available in the text -->
            <div class="quick-options" *ngIf="!msg.isUser && hasOptions(msg.text)">
              <button class="opt-btn" (click)="sendQuickReply('1', 'Symptoms')">1. Check Symptoms</button>
              <button class="opt-btn" (click)="sendQuickReply('2', 'Cure')">2. Get Cure</button>
              <button class="opt-btn" (click)="sendQuickReply('3', 'Doctor')">3. Book Appointment</button>
              <button class="opt-btn" (click)="sendQuickReply('4', 'General')">4. Health Tips</button>
            </div>
            
            <!-- Follow up options -->
            <div class="quick-options" *ngIf="!msg.isUser && msg.text.includes('Do you want to (1) Get Cure details, or (2) Find a Doctor?')">
              <button class="opt-btn" (click)="sendQuickReply('1', 'Cure')">1. Get Cure</button>
              <button class="opt-btn" (click)="sendQuickReply('2', 'Doctor')">2. Find Doctor</button>
            </div>
            
            <!-- Doctor List Rendering if context is Doctor -->
            <div class="doctor-list" *ngIf="!msg.isUser && msg.showDoctors">
              <div class="doc-controls">
                <input type="text" [(ngModel)]="docSearch" placeholder="Filter specializations (e.g. Cardiologist)">
                <button class="btn-primary" (click)="loadDoctors()">Search</button>
              </div>
              <div class="docs-grid" *ngIf="doctors.length > 0">
                 <div class="doc-card" *ngFor="let d of doctors">
                   <h4>{{d.name}}</h4>
                   <p>{{d.specialization}}</p>
                   <p><small>{{d.location}}</small></p>
                   <button class="btn-outline" (click)="viewProfile(d.id)">
                     View Profile
                   </button>
                 </div>
              </div>
            </div>
            
            <!-- Patient Form block (Improved) -->
            <div class="patient-form-card" *ngIf="!msg.isUser && contextMode === 'PatientForm' && (msg.text.includes('symptoms') || msg.text.includes('help'))">
              <div class="form-header">
                <h3>Patient Information</h3>
                <p>Please fill in these details for a better analysis</p>
              </div>
              <div class="form-body">
                <div class="form-row">
                  <div class="form-group flex-2">
                    <label>Full Name</label>
                    <input type="text" [(ngModel)]="patientName" placeholder="Enter your name">
                  </div>
                  <div class="form-group flex-1">
                    <label>Age</label>
                    <input type="number" [(ngModel)]="patientAge" placeholder="Age">
                  </div>
                </div>
                <div class="form-group">
                  <label>Blood Group</label>
                  <select [(ngModel)]="patientBlood">
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Symptom Description</label>
                  <textarea [(ngModel)]="patientSymptoms" placeholder="e.g., I have a high fever and persistent cough for 2 days..." rows="4"></textarea>
                </div>
              </div>
              <div class="form-footer">
                <button class="btn-submit" (click)="submitPatientForm()" [disabled]="!patientSymptoms || !patientName">
                  <span *ngIf="!isTyping">Analyze My Symptoms</span>
                  <span *ngIf="isTyping">Processing...</span>
                </button>
              </div>
            </div>
            
          </div>
          <div class="avatar user-avatar" *ngIf="msg.isUser">👤</div>
        </div>
        
        <div class="typing-indicator" *ngIf="isTyping">
          <div class="dot"></div><div class="dot"></div><div class="dot"></div>
        </div>
      </div>

      <div class="chat-inputarea">
        <input type="text" [(ngModel)]="currentInput" 
               (keyup.enter)="sendMessage()" 
               placeholder="Type your message here..."
               [disabled]="isTyping">
        <button [disabled]="!currentInput.trim() || isTyping" (click)="sendMessage()" class="send-btn">
          <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .chat-container {
      max-width: 900px;
      margin: 20px auto;
      background: var(--surface-color);
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.4);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      height: calc(100vh - 180px);
    }
    .chat-container.widget-mode {
      height: 100%;
      margin: 0;
      max-width: none;
      border-radius: 0;
      box-shadow: none;
    }
    .chat-header {
      background: linear-gradient(135deg, var(--secondary-color), var(--primary-color));
      padding: 15px 25px;
      color: white;
      font-size: 1.2rem;
      font-weight: bold;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .mode-badge {
      background: rgba(0,0,0,0.3);
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 0.8rem;
    }
    .chat-window {
      flex: 1;
      padding: 25px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 20px;
      scroll-behavior: smooth;
    }
    .welcome-message {
      text-align: center;
      margin-top: auto;
      margin-bottom: auto;
      color: var(--text-muted);
    }
    .welcome-message .bot-avatar {
      font-size: 4rem;
      margin-bottom: 20px;
    }
    .highlight {
      color: var(--primary-color);
    }
    
    .message-wrapper {
      display: flex;
      max-width: 85%;
      align-items: flex-end;
      gap: 15px;
    }
    .message-wrapper.user {
      align-self: flex-end;
      flex-direction: row;
    }
    .message-wrapper.bot {
      align-self: flex-start;
    }
    
    .avatar {
      font-size: 1.8rem;
      background: rgba(255,255,255,0.05);
      border-radius: 50%;
      padding: 5px;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .message-content {
      padding: 15px 20px;
      border-radius: 18px;
      line-height: 1.5;
    }
    .bot .message-content {
      background: rgba(0, 210, 255, 0.1);
      border-bottom-left-radius: 4px;
      border: 1px solid rgba(0, 210, 255, 0.2);
    }
    .bot .message-content h3 {
      font-size: 1.1rem;
      color: var(--primary-color);
      margin: 15px 0 10px 0;
      border-bottom: 1px solid rgba(33, 150, 243, 0.2);
      padding-bottom: 5px;
    }
    .bot .message-content ul {
      margin: 10px 0;
      padding-left: 20px;
    }
    .bot .message-content li {
      margin-bottom: 5px;
    }
    .user .message-content {
      background: linear-gradient(135deg, var(--secondary-color), var(--primary-color));
      color: white;
      border-bottom-right-radius: 4px;
    }
    
    .quick-options {
      margin-top: 15px;
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    .opt-btn {
      background: transparent;
      border: 1px solid var(--primary-color);
      color: var(--primary-color);
      padding: 8px 15px;
      border-radius: 20px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.2s;
    }
    .opt-btn:hover {
      background: var(--primary-color);
      color: var(--bg-color);
    }
    
    /* Doctor Grid */
    .doctor-list {
      margin-top: 20px;
      background: rgba(0,0,0,0.2);
      padding: 15px;
      border-radius: 12px;
    }
    .doc-controls {
      display: flex;
      gap: 10px;
      margin-bottom: 15px;
    }
    .docs-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 15px;
      max-height: 400px;
      overflow-y: auto;
      padding-right: 10px;
    }
    .docs-grid::-webkit-scrollbar {
      width: 6px;
    }
    .docs-grid::-webkit-scrollbar-thumb {
      background: rgba(255,255,255,0.1);
      border-radius: 10px;
    }
    .doc-card {
      background: var(--surface-color);
      padding: 15px;
      border-radius: 8px;
      border: 1px solid rgba(255,255,255,0.1);
    }
    .doc-card h4 { margin: 0 0 5px 0; color: var(--primary-color); }
    .doc-card p { margin: 5px 0; font-size: 0.9rem; }
    
    /* Patient Form Redesign */
    .patient-form-card {
      margin-top: 20px;
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      animation: slideIn 0.3s ease-out;
    }
    @keyframes slideIn {
      from { transform: translateY(10px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .form-header {
      padding: 15px 20px;
      background: rgba(255,255,255,0.05);
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .form-header h3 { margin: 0; color: var(--primary-color); font-size: 1.1rem; }
    .form-header p { margin: 5px 0 0 0; font-size: 0.85rem; color: var(--text-muted); }
    
    .form-body { padding: 20px; display: flex; flex-direction: column; gap: 15px; }
    .form-row { display: flex; gap: 15px; }
    .flex-1 { flex: 1; }
    .flex-2 { flex: 2; }
    
    .form-group { display: flex; flex-direction: column; gap: 8px; }
    .form-group label { font-size: 0.85rem; font-weight: 600; color: var(--text-muted); margin-left: 5px; }
    
    .form-group input, .form-group textarea, .form-group select {
      width: 100%;
      padding: 12px 15px;
      border-radius: 10px;
      border: 1.5px solid rgba(255,255,255,0.1);
      background: rgba(0,0,0,0.2);
      color: var(--text-color);
      box-sizing: border-box;
      font-family: inherit;
      transition: all 0.2s;
    }
    .form-group input:focus, .form-group textarea:focus, .form-group select:focus {
      outline: none;
      border-color: var(--primary-color);
      background: rgba(255,255,255,0.05);
    }
    
    .form-footer { padding: 0 20px 20px 20px; }
    .btn-submit {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, var(--secondary-color), var(--primary-color));
      color: white;
      border: none;
      border-radius: 10px;
      font-weight: bold;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .btn-submit:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0, 210, 255, 0.4);
    }
    .btn-submit:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .chat-inputarea {
      padding: 20px;
      background: rgba(0,0,0,0.2);
      display: flex;
      gap: 15px;
      align-items: center;
      border-top: 1px solid rgba(255,255,255,0.05);
    }
    .chat-inputarea input {
      flex: 1;
      margin: 0;
      padding: 15px 20px;
      border-radius: 30px;
      border: 1px solid rgba(255,255,255,0.1);
      background: rgba(255,255,255,0.05);
      font-size: 1rem;
    }
    .send-btn {
      background: var(--primary-color);
      color: var(--bg-color);
      border: none;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s;
    }
    .send-btn:hover:not(:disabled) {
      transform: scale(1.1);
    }
    .send-btn:disabled {
      background: var(--text-muted);
      cursor: not-allowed;
    }
    
    .typing-indicator {
      display: flex;
      gap: 5px;
      padding: 15px 20px;
      background: rgba(0, 210, 255, 0.1);
      border-radius: 18px;
      border-bottom-left-radius: 4px;
      width: fit-content;
      margin-left: 55px;
    }
    .dot {
      width: 8px;
      height: 8px;
      background: var(--primary-color);
      border-radius: 50%;
      animation: bounce 1.4s infinite ease-in-out both;
    }
    .dot:nth-child(1) { animation-delay: -0.32s; }
    .dot:nth-child(2) { animation-delay: -0.16s; }
    @keyframes bounce {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1); }
    }
    
    ::ng-deep .alert-red {
      color: #ff4b4b;
      font-weight: bold;
    }
  `]
})
export class ChatbotComponent implements OnInit, AfterViewChecked {
  @Input() isWidget: boolean = false;
  @ViewChild('scrollMe') private myScrollContainer!: ElementRef;
  
  messages: {text: string, isUser: boolean, displayedText?: string, showDoctors?: boolean}[] = [];
  currentInput = '';
  isTyping = false;
  contextMode = 'General';
  
  // Doctor List
  docSearch = '';
  doctors: Doctor[] = [];
  allDoctors: Doctor[] = [];

  // Patient Form
  patientName = '';
  patientAge = '';
  patientBlood = '';
  patientSymptoms = '';

  constructor(private apiService: ApiService, private cdr: ChangeDetectorRef, private router: Router) {}

  ngOnInit() {
    this.scrollToBottom();
    this.handleQueryParams();
  }

  private handleQueryParams() {
    const params = new URLSearchParams(window.location.search);
    const intent = params.get('intent');
    const query = params.get('q');
    
    if (intent === 'doctor' && query) {
      this.contextMode = 'Doctor';
      this.docSearch = query;
      this.loadDoctors();
      this.messages.push({ 
        text: `Showing available specialists for: **${query}**`, 
        isUser: false, 
        displayedText: `Showing available specialists for: **${query}**`,
        showDoctors: true
      });
    }
  }

  ngAfterViewChecked() {
    // Aggressive auto-scroll removed to fix scrolling glitch
    // this.scrollToBottom();
  }

  scrollToBottom(force: boolean = false): void {
    try {
      if (this.myScrollContainer) {
        const el = this.myScrollContainer.nativeElement;
        // Only scroll if force=true OR user is already near the bottom (within 150px)
        const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 150;
        
        if (force || isNearBottom) {
          el.scrollTop = el.scrollHeight;
        }
      }
    } catch(err) { }
  }

  hasOptions(text: string): boolean {
    return text.includes("Please choose an option:");
  }

  formatReply(text: string): string {
    if (!text) return '';
    
    // 1. Headers (### Heading)
    let formatted = text.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    
    // 2. Bold text (**text**)
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // 3. Lists (- Item or * Item)
    // First, wrap sequential lines starting with - into <ul>
    const lines = formatted.split('\n');
    let inList = false;
    let finalHtml = '';
    
    for (let line of lines) {
      if (line.trim().startsWith('- ')) {
        if (!inList) {
          finalHtml += '<ul>';
          inList = true;
        }
        finalHtml += `<li>${line.trim().substring(2)}</li>`;
      } else {
        if (inList) {
          finalHtml += '</ul>';
          inList = false;
        }
        finalHtml += line + '\n';
      }
    }
    if (inList) finalHtml += '</ul>';
    
    // 4. Line breaks
    formatted = finalHtml.replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>');
    
    // 5. Emergency highlights
    if (formatted.includes('EMERGENCY') || formatted.includes('CRITICAL')) {
      formatted = `<div class="alert-red">${formatted}</div>`;
    }
    
    return formatted;
  }

  sendQuickReply(text: string, newContext: string) {
    if (text.toLowerCase().includes('yes') || ["1","2","3","4"].includes(text)) {
      this.currentInput = text;
    } else {
      this.currentInput = text;
    }
    this.contextMode = newContext;
    this.sendMessage();
  }

  loadDoctors() {
    this.apiService.getDoctors().subscribe({
      next: (docs) => {
        this.allDoctors = docs;
        this.filterDoctors();
      },
      error: (e) => console.error(e)
    });
  }

  filterDoctors() {
    if (this.docSearch) {
      const q = this.docSearch.toLowerCase();
      this.doctors = this.allDoctors.filter(d => {
        const name = d.name.toLowerCase();
        const spec = d.specialization.toLowerCase();
        
        // Match if string exists, OR handle 'sergen' typo, OR first 3 letters match
        return name.includes(q) || 
               spec.includes(q) || 
               (q.includes('serg') && spec.includes('surgeon')) ||
               (q.includes('phys') && spec.includes('physician')) ||
               (q.length > 3 && (name.startsWith(q.substring(0, 3)) || spec.startsWith(q.substring(0, 3))));
      });

      // FALLBACK: If no specific specialists found, show General Physicians
      if (this.doctors.length === 0) {
        this.doctors = this.allDoctors.filter(d => 
          d.specialization.toLowerCase().includes('physician') || 
          d.specialization.toLowerCase().includes('general')
        );
      }
    } else {
      this.doctors = this.allDoctors;
    }
    this.cdr.detectChanges();
  }

  viewProfile(id: number) {
    this.router.navigate(['/doctor', id]);
  }

  submitPatientForm() {
    if (!this.patientSymptoms.trim() || !this.patientName.trim()) return;
    
    // Construct a structured but natural message
    const msg = `PATIENT_DATA [Name: ${this.patientName}, Age: ${this.patientAge}, Blood: ${this.patientBlood}] Symptoms: ${this.patientSymptoms}`;
    
    this.currentInput = msg;
    this.contextMode = 'Symptoms';
    this.sendMessage();
    
    // Reset form fields
    this.patientName = ''; 
    this.patientAge = ''; 
    this.patientBlood = ''; 
    this.patientSymptoms = '';
  }

  processActions(responseText: string): { replyText: string, showDoctors: boolean } {
    let replyText = responseText;
    let showDoctors = false;

    // Direct Regex match for Doctor Action
    const showDocsMatch = replyText.match(/\[ACTION:SHOW_DOCTORS(?::(.*?))?\]/);
    if (showDocsMatch) {
      if (showDocsMatch[1]) {
        this.docSearch = showDocsMatch[1];
      }
      replyText = replyText.replace(showDocsMatch[0], '').trim();
      this.contextMode = 'Doctor';
      this.loadDoctors();
      showDoctors = true;
    }

    if (replyText.includes('[ACTION:SHOW_PATIENT_FORM]')) {
      replyText = replyText.replace('[ACTION:SHOW_PATIENT_FORM]', '').trim();
      this.contextMode = 'PatientForm';
    }

    return { replyText, showDoctors };
  }

  sendMessage() {
    if (!this.currentInput.trim()) return;

    const userMsg = this.currentInput;
    this.messages.push({ text: userMsg, isUser: true, displayedText: userMsg });
    this.currentInput = '';
    this.isTyping = true;
    
    if (userMsg.toLowerCase() === 'yes') {
       this.contextMode = 'General';
    }

    this.apiService.sendMessage(userMsg, this.contextMode).subscribe({
      next: (res: any) => {
        this.isTyping = false;
        let responseRaw = res.reply || res.Reply || "Error reading reply text.";
        console.log("RAW BOT REPLY:", responseRaw);
        
        const { replyText, showDoctors } = this.processActions(responseRaw);
        console.log("PROCESSED REPLY:", replyText, "SHOW DOCS:", showDoctors);
        
        let replyMsg: any = { text: replyText, isUser: false, displayedText: '', showDoctors };
        this.messages.push(replyMsg);
        
        let i = 0;
        let typingInterval = setInterval(() => {
          replyMsg.displayedText += replyText.charAt(i);
          i++;
          this.cdr.detectChanges();
          this.scrollToBottom();
          
          if (i >= replyText.length) {
            clearInterval(typingInterval);
          }
        }, 15);
      },
      error: (err: any) => {
        console.error("API Error:", err);
        this.isTyping = false;
        let errorMsg = "Sorry, I am facing connectivity issues right now.";
        if (err.status === 401) {
            errorMsg = "Your session expired or you aren't logged in! Please refresh and log in again.";
        }
        this.messages.push({ text: errorMsg, isUser: false });
        this.cdr.detectChanges();
        this.scrollToBottom(true);
      }
    });
  }
}
