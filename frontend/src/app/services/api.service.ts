import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChatMessage, Doctor, Appointment } from '../models/interfaces';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
  }

  // Chat
  sendMessage(message: string, contextMode: string = 'General'): Observable<any> {
    return this.http.post(`${environment.apiUrl}/Chat/message`, { message, contextMode }, { headers: this.getHeaders() });
  }

  getChatHistory(): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${environment.apiUrl}/Chat/history`, { headers: this.getHeaders() });
  }

  // Doctors
  getDoctors(specialization?: string): Observable<Doctor[]> {
    let url = `${environment.apiUrl}/Doctors`;
    if (specialization) url += `?specialization=${specialization}`;
    return this.http.get<Doctor[]>(url);
  }

  getDoctor(id: number): Observable<Doctor> {
    return this.http.get<Doctor>(`${environment.apiUrl}/Doctors/${id}`);
  }

  // Appointments
  bookAppointment(doctorId: number, date: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/Appointments`, { doctorId, date }, { headers: this.getHeaders() });
  }

  getAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${environment.apiUrl}/Appointments`, { headers: this.getHeaders() });
  }

  updateAppointmentStatus(id: number, status: string): Observable<any> {
    return this.http.patch(`${environment.apiUrl}/Appointments/${id}/status`, `"${status}"`, { 
      headers: this.getHeaders().set('Content-Type', 'application/json') 
    });
  }

  // Staff Operations
  getStaffStats(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/Staff/stats`, { headers: this.getHeaders() });
  }

  getStaffPatients(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/Staff/patients`, { headers: this.getHeaders() });
  }

  getPatientRecords(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/Staff/patients/${id}/records`, { headers: this.getHeaders() });
  }

  deactivateDoctor(id: number): Observable<any> {
    return this.http.patch(`${environment.apiUrl}/Staff/doctors/${id}/deactivate`, {}, { headers: this.getHeaders() });
  }

  deactivatePatient(id: number): Observable<any> {
    return this.http.patch(`${environment.apiUrl}/Staff/patients/${id}/deactivate`, {}, { headers: this.getHeaders() });
  }
}
