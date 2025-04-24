import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { MedicalRecordsService } from '../medical-records/medical-records.service';

@Injectable({
  providedIn: 'root',
})
export class MedicalRecordUtilityService {
  constructor(private medicalRecordsService: MedicalRecordsService) {}

  /**
   * Check if a medical record exists and return its ID
   * @param patientId The patient ID to check
   * @returns Observable of the record ID if found, undefined if not
   */
  checkMedicalRecord(patientId: number): Observable<number | undefined> {
    return this.medicalRecordsService.getMedicalRecord(patientId).pipe(
      map((data) => data?.id),
      catchError((err) => {
        if (err.status === 404 || err.message?.includes('Error Code: 404')) {
          return of(undefined);
        }
        console.error('Error checking medical record:', err);
        return of(undefined);
      })
    );
  }
}
