import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AppointmentDto,
  AppointmentCreateDto,
  AppointmentUpdateDto,
} from '../models/appointment.model';

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  private apiUrl = 'https://localhost:7133/api/appointments';

  constructor(private http: HttpClient) {}

  getAppointments(): Observable<AppointmentDto[]> {
    return this.http.get<AppointmentDto[]>(this.apiUrl);
  }

  getAppointment(id: number): Observable<AppointmentDto> {
    return this.http.get<AppointmentDto>(`${this.apiUrl}/${id}`);
  }

  getAppointmentsByProvider(providerId: number): Observable<AppointmentDto[]> {
    return this.http.get<AppointmentDto[]>(
      `${this.apiUrl}/api/provider/${providerId}`
    );
  }

  getAppointmentsByPatient(patientId: number): Observable<AppointmentDto[]> {
    return this.http.get<AppointmentDto[]>(
      `${this.apiUrl}/api/patient/${patientId}`
    );
  }

  getAvailableSlots(providerId: number, date: Date): Observable<string[]> {
    const formattedDate = date.toISOString().split('T')[0];
    return this.http.get<string[]>(
      `${this.apiUrl}/api/available-slots?providerId=${providerId}&date=${formattedDate}`
    );
  }

  createAppointment(
    appointment: AppointmentCreateDto
  ): Observable<AppointmentDto> {
    return this.http.post<AppointmentDto>(
      `${this.apiUrl}/api/appointments`,
      appointment
    );
  }

  updateAppointment(
    id: number,
    appointment: AppointmentUpdateDto
  ): Observable<AppointmentDto> {
    return this.http.put<AppointmentDto>(`${this.apiUrl}/${id}`, appointment);
  }

  deleteAppointment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  cancelAppointment(id: number): Observable<AppointmentDto> {
    return this.http.patch<AppointmentDto>(`${this.apiUrl}/${id}/cancel`, {});
  }

  rescheduleAppointment(
    id: number,
    startTime: string,
    endTime: string
  ): Observable<AppointmentDto> {
    const rescheduleData = { startTime, endTime };
    return this.http.patch<AppointmentDto>(
      `${this.apiUrl}/${id}/reschedule`,
      rescheduleData
    );
  }

  getAppointmentsByDateRange(
    startDate: Date,
    endDate: Date,
    providerId?: number
  ): Observable<AppointmentDto[]> {
    let params = new HttpParams()
      .set('startDate', startDate.toISOString())
      .set('endDate', endDate.toISOString());

    if (providerId) {
      params = params.set('providerId', providerId.toString());
    }

    return this.http.get<AppointmentDto[]>(`${this.apiUrl}/date-range`, {
      params,
    });
  }

  confirmAppointment(id: number): Observable<AppointmentDto> {
    return this.http.patch<AppointmentDto>(`${this.apiUrl}/${id}/confirm`, {});
  }

  completeAppointment(id: number, notes?: string): Observable<AppointmentDto> {
    const data = notes ? { notes } : {};
    return this.http.patch<AppointmentDto>(
      `${this.apiUrl}/${id}/complete`,
      data
    );
  }
}
