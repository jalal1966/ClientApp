// medicine.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Medicine,
  MedicineCheckResult,
} from '../../models/medicalRecord.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MedicineService {
  private apiUrl = environment.apiUrl;
  private readonly baseUrl = 'api/Medicines';

  constructor(private http: HttpClient) {}

  // Get all medicines
  getMedicines(): Observable<Medicine[]> {
    const url = `${this.apiUrl}/${this.baseUrl}`;
    console.log('API URL:', url);
    return this.http.get<Medicine[]>(url);
  }

  // Get medicine by id
  getMedicine(id: number): Observable<Medicine> {
    return this.http.get<Medicine>(`${this.apiUrl}/${this.baseUrl}/${id}`);
  }

  // Create new medicine
  createMedicine(medicine: Omit<Medicine, 'id'>): Observable<Medicine> {
    return this.http.post<Medicine>(`${this.apiUrl}/${this.baseUrl}`, medicine);
  }

  // Update medicine
  updateMedicine(medicine: Medicine): Observable<Medicine> {
    return this.http.put<Medicine>(
      `${this.apiUrl}${this.apiUrl}/${this.baseUrl}/${medicine.id}`,
      medicine
    );
  }

  // Delete medicine
  deleteMedicine(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}${this.apiUrl}/${this.baseUrl}/${id}`
    );
  }

  // New method to check and create medicine
  checkAndCreateMedicine(
    medicine: Omit<Medicine, 'id'>
  ): Observable<MedicineCheckResult> {
    return this.http.post<MedicineCheckResult>(
      `${this.apiUrl}/${this.baseUrl}/check-and-create`,
      medicine
    );
  }
}
