import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Appointment,
  AppointmentCreate,
  AppointmentUpdate,
} from '../models/appointment.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  private apiUrl = environment.apiUrl;
  // private apiUrl = 'https://localhost:5000/api/appointments';

  constructor(private http: HttpClient) {}

  getAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/api/appointments`);
  }

  getAppointment(id: number): Observable<Appointment> {
    return this.http.get<Appointment>(`${this.apiUrl}/api/appointments/${id}`);
  }

  getAppointmentsByProvider(providerId: number): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(
      `${this.apiUrl}/api/provider/${providerId}`
    );
  }

  getAppointmentsByPatient(patientId: number): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(
      `${this.apiUrl}/api/patient/${patientId}`
    );
  }

  getAvailableSlots(providerId: number, date: Date): Observable<string[]> {
    const formattedDate = date.toISOString().split('T')[0];
    return this.http.get<string[]>(
      `${this.apiUrl}/api/available-slots?providerId=${providerId}&date=${formattedDate}`
    );
  }

  createAppointment(appointment: AppointmentCreate): Observable<Appointment> {
    const doi = this.http.post<Appointment>(
      `${this.apiUrl}/api/appointments`,
      appointment
    );
    console.log('doi', doi);
    return this.http.post<Appointment>(
      `${this.apiUrl}/api/appointments`,
      appointment
    );
  }

  updateAppointment(
    id: number,
    appointment: AppointmentUpdate
  ): Observable<Appointment> {
    return this.http.put<Appointment>(
      `${this.apiUrl}/api/appointments/${id}`,
      appointment
    );
  }

  deleteAppointment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/appointments/${id}`);
  }

  // TO DO
  cancelAppointment(id: number): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.apiUrl}/${id}/cancel`, {});
  }

  rescheduleAppointment(
    id: number,
    startTime: string,
    endTime: string
  ): Observable<Appointment> {
    const rescheduleData = { startTime, endTime };
    return this.http.patch<Appointment>(
      `${this.apiUrl}/${id}/reschedule`,
      rescheduleData
    );
  }
  updateAppointmentStatus(
    appointmentId: number,
    status: string
  ): Observable<Appointment> {
    return this.http.patch<Appointment>(
      `${this.apiUrl}/api/appointments/${appointmentId}/status`,
      { status }
    );
  }

  getAppointmentsByDateRange(
    startDate: string | Date,
    endDate: string | Date
  ): Observable<Appointment[]> {
    // Format dates to ISO strings if they're Date objects
    const formattedStartDate =
      startDate instanceof Date ? startDate.toISOString() : startDate;
    const formattedEndDate =
      endDate instanceof Date ? endDate.toISOString() : endDate;
    const test = this.http.get<Appointment[]>(
      `${this.apiUrl}/api/appointments/date-range?startDate=${formattedStartDate}&endDate=${formattedEndDate}`
    );

    console.log('test', test);
    return this.http.get<Appointment[]>(
      `${this.apiUrl}/api/appointments/date-range?startDate=${formattedStartDate}&endDate=${formattedEndDate}`
    );
  }

  getDoctorAppointmentsByDateRange(
    startDate: Date,
    endDate: Date,
    providerId?: number
  ): Observable<Appointment[]> {
    let params = new HttpParams()
      .set('startDate', startDate.toISOString())
      .set('endDate', endDate.toISOString());

    if (providerId) {
      params = params.set('providerId', providerId.toString());
    }

    return this.http.get<Appointment[]>(
      `${this.apiUrl}/api/appointments/doctr-waiting-list?startDate=${startDate}&endDate=${endDate}providerId`,
      {
        params,
      }
    );
  }
  confirmAppointment(id: number): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.apiUrl}/${id}/confirm`, {});
  }

  completeAppointment(id: number, notes?: string): Observable<Appointment> {
    const data = notes ? { notes } : {};
    return this.http.patch<Appointment>(`${this.apiUrl}/${id}/complete`, data);
  }
}
