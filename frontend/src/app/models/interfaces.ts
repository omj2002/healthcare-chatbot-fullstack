export interface User {
  id?: number;
  name: string;
  email: string;
  role?: string;
  profileImage?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ChatMessage {
  id?: number;
  userId?: number;
  message: string;
  botReply: string;
  timestamp?: Date;
}

export interface Doctor {
  id: number;
  name: string;
  specialization: string;
  location: string;
  available: boolean;
  profileImage?: string;
}

export interface Appointment {
  id?: number;
  userId?: number;
  doctorId: number;
  date: Date | string;
  status?: string;
  doctor?: Doctor;
  user?: User; // Added for doctor view
}
