import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Appointment,
  AppointmentCreate,
  AppointmentUpdate,
} from '../../models/appointment.model';
import { environment } from '../../../environments/environment';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  private apiUrl = environment.apiUrl;
  private readonly baseUrl = '/api/appointments';
  // private apiUrl = 'https://localhost:5000/api/appointments';

  constructor(private http: HttpClient) {}

  // Active
  getAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}${this.baseUrl}`);
  }

  // Active
  getAppointment(id: number): Observable<Appointment> {
    return this.http.get<Appointment>(`${this.apiUrl}${this.baseUrl}/${id}`);
  }

  // Active
  getAppointmentsByProvider(providerId: number): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(
      `${this.apiUrl}${this.baseUrl}/provider/${providerId}`
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

  // Active
  createAppointment(appointment: AppointmentCreate): Observable<Appointment> {
    return this.http.post<Appointment>(
      `${this.apiUrl}${this.baseUrl}`,
      appointment
    );
  }

  updateAppointment(
    id: number,
    appointment: AppointmentUpdate
  ): Observable<Appointment> {
    return this.http.put<Appointment>(
      `${this.apiUrl}${this.baseUrl}/${id}`,
      appointment
    );
  }

  // active
  updateAppointmentStatus(
    appointmentId: number,
    status: string
  ): Observable<Appointment> {
    const url = `${this.apiUrl}${this.baseUrl}/${appointmentId}/status`;
    return this.http.put<Appointment>(url, JSON.stringify(status), {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    });
  }

  deleteAppointment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${this.baseUrl}/${id}`);
  }

  /* rescheduleAppointment(
    id: number,
    startTime: string,
    endTime: string
  ): Observable<Appointment> {
    const rescheduleData = { startTime, endTime };
    return this.http.patch<Appointment>(
      `${this.apiUrl}/${id}/reschedule`,
      rescheduleData
    );
  } */

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
      `${this.apiUrl}${this.baseUrl}/date-range?startDate=${formattedStartDate}&endDate=${formattedEndDate}`
    );

    console.log('test', test);
    return this.http.get<Appointment[]>(
      `${this.apiUrl}${this.baseUrl}/date-range?startDate=${formattedStartDate}&endDate=${formattedEndDate}`
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
      `${this.apiUrl}${this.baseUrl}/doctr-waiting-list?startDate=${startDate}&endDate=${endDate}providerId`,
      {
        params,
      }
    );
  }
  confirmAppointment(id: number): Observable<Appointment> {
    return this.http.patch<Appointment>(
      `${this.apiUrl}${this.baseUrl}/${id}/confirm`,
      {}
    );
  }

  completeAppointment(id: number, notes?: string): Observable<Appointment> {
    const data = notes ? { notes } : {};
    return this.http.patch<Appointment>(
      `${this.apiUrl}${this.baseUrl}/${id}/complete`,
      data
    );
  }
}
