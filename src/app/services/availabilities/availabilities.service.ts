import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Availability, TimeSlot } from '../../models/availability.model';

@Injectable({
  providedIn: 'root',
})
export class AvailabilitiesService {
  private apiUrl = 'api/availabilities';

  constructor(private http: HttpClient) {}

  getAvailabilityByUser(userId: number): Observable<Availability[]> {
    return this.http.get<Availability[]>(`${this.apiUrl}/user/${userId}`);
  }

  getAvailability(id: number): Observable<Availability> {
    return this.http.get<Availability>(`${this.apiUrl}/${id}`);
  }

  createAvailability(availability: Availability): Observable<Availability> {
    return this.http.post<Availability>(this.apiUrl, availability);
  }

  updateAvailability(availability: Availability): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/${availability.id}`,
      availability
    );
  }

  deleteAvailability(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getAvailabilityCalendar(
    userId: number,
    startDate: Date,
    endDate: Date
  ): Observable<{ [key: string]: TimeSlot[] }> {
    const params = new HttpParams()
      .set('startDate', startDate.toISOString())
      .set('endDate', endDate.toISOString());

    return this.http.get<{ [key: string]: TimeSlot[] }>(
      `${this.apiUrl}/calendar/${userId}`,
      { params }
    );
  }
}
