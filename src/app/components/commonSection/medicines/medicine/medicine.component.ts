import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ImportResult, Medicine } from '../../../../models/medicalRecord.model';
import { from, map, mergeMap, Observable, toArray } from 'rxjs';
import { MedicineService } from '../../../../services/medicine/medicine.service';
import * as XLSX from 'xlsx';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-medicine',
  imports: [CommonModule, RouterModule, HttpClientModule],
  templateUrl: './medicine.component.html',
  styleUrl: './medicine.component.scss',
})
export class MedicineComponent implements OnInit {
  medicines$!: Observable<Medicine[]>;
  selectedFile: File | null = null;
  isUploading = false;
  result: ImportResult = { added: 0, duplicates: 0 };
  apiUrl = environment.apiUrl; // Replace
  baseUrl = '/api/Medicines/bulk-import';
  currentDate = new Date();
  fileName = '';

  constructor(
    private medicineService: MedicineService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadMedicines();
  }

  loadMedicines(): void {
    this.medicines$ = this.medicineService.getMedicines();
  }

  viewDetails(id: number): void {
    // Navigate to details page
    // Example: this.router.navigate(['/medicines', id]);
    console.log('View details for medicine ID:', id);
  }

  addNewMedicine(): void {
    // Navigate to add page or open modal
    // Example: this.router.navigate(['/medicines/new']);
    console.log('Add new medicine');
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.fileName = file.name;
    } else {
      this.selectedFile = null;
      this.fileName = '';
    }
  }

  drugUpdate() {
    if (!this.selectedFile) {
      this.showNotification('error', 'Please select an Excel file first');
      return;
    }

    this.isUploading = true;

    // Read the Excel file
    const fileReader = new FileReader();
    fileReader.onload = (e: any) => {
      try {
        const arrayBuffer = e.target.result;
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });

        // Assuming the first sheet contains our data
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Convert to JSON
        const excelData = XLSX.utils.sheet_to_json<any>(worksheet);

        // Transform Excel data to match our Medicine model
        const medicines: Medicine[] = this.mapExcelDataToMedicines(excelData);

        // Send to API to save without duplicates
        this.saveMedicinesWithoutDuplicates(medicines);
      } catch (error) {
        console.error('Error processing Excel file:', error);
        this.isUploading = false;
        this.showNotification(
          'error',
          'Failed to process Excel file. Please check the format.'
        );
      }
    };

    fileReader.readAsArrayBuffer(this.selectedFile);
  }

  private mapExcelDataToMedicines(excelData: any[]): Medicine[] {
    // Map Excel columns to Medicine properties
    // Adjust this mapping based on your Excel file structure
    return excelData
      .map((row) => {
        const medicine: Medicine = {
          name:
            row['Name'] ||
            row['name'] ||
            row['MEDICINE NAME'] ||
            row['Medicine Name'] ||
            '',
          packaging:
            row['Packaging'] || row['packaging'] || row['PACKAGING'] || null,
          company:
            row['Company'] ||
            row['company'] ||
            row['MANUFACTURER'] ||
            row['Manufacturer'] ||
            null,
          composition:
            row['Composition'] ||
            row['composition'] ||
            row['COMPOSITION'] ||
            null,
          note: row['Note'] || row['note'] || row['NOTES'] || null,
        };

        // Skip rows without a medicine name
        if (!medicine.name || medicine.name.trim() === '') {
          return null;
        }

        // Clean and standardize the data
        medicine.name = medicine.name.trim();
        if (medicine.packaging) medicine.packaging = medicine.packaging.trim();
        if (medicine.company) medicine.company = medicine.company.trim();
        if (medicine.composition)
          medicine.composition = medicine.composition.trim();
        if (medicine.note) medicine.note = medicine.note.trim();

        return medicine;
      })
      .filter((medicine) => medicine !== null) as Medicine[];
  }

  private saveMedicinesWithoutDuplicates(medicines: Medicine[]): void {
    if (medicines.length === 0) {
      this.isUploading = false;
      this.showNotification(
        'warning',
        'No valid medicine data found in the Excel file'
      );
      return;
    }

    // Send data to backend API that handles duplicate checking
    this.http
      .post<ImportResult>(`${this.apiUrl}${this.baseUrl}`, { medicines })
      .subscribe({
        next: (response) => {
          this.result = response;
          this.isUploading = false;
          this.currentDate = new Date();

          if (response.added > 0) {
            this.showNotification(
              'success',
              `Import completed: ${response.added} medicines added, ${response.duplicates} duplicates skipped`
            );
          } else if (response.duplicates > 0) {
            this.showNotification(
              'warning',
              `All medicines (${response.duplicates}) already exist in the database`
            );
          }
        },
        error: (error) => {
          console.error('Error saving medicines:', error);
          this.isUploading = false;
          this.showNotification(
            'error',
            'Failed to save medicines. Please try again.'
          );
        },
      });
  }

  // Placeholder for notification system - replace with your app's notification service
  private showNotification(
    type: 'success' | 'warning' | 'error',
    message: string
  ): void {
    // This is a placeholder - implement with your preferred notification system
    // Examples: NGX-Toastr, Material Snackbar, or custom notification service
    console.log(`[${type}] ${message}`);

    // If using no notification library:
    alert(message);
  }

  /*  drugUpdate() {
    if (!this.selectedFile) {
      this.showNotification('error', 'Please select an Excel file first');
      return;
    }

    this.isUploading = true;
    // Read the Excel file
    const fileReader = new FileReader();
    fileReader.onload = (e: any) => {
      try {
        const arrayBuffer = e.target.result;
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });

        // Assuming the first sheet contains our data
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Convert to JSON
        const excelData = XLSX.utils.sheet_to_json<any>(worksheet);

        // Transform Excel data to match our Medicine model
        const medicines: Medicine[] = this.mapExcelDataToMedicines(excelData);

        // Send to API to save without duplicates
        this.saveMedicinesWithoutDuplicates(medicines);
      } catch (error) {
        console.error('Error processing Excel file:', error);
        this.isUploading = false;
        this.showNotification(
          'error',
          'Failed to process Excel file. Please check the format.'
        );
      }
    };

    fileReader.readAsArrayBuffer(this.selectedFile);
  }
  private mapExcelDataToMedicines(excelData: any[]): Medicine[] {
    // Map Excel columns to Medicine properties
    // Adjust this mapping based on your Excel file structure
    return excelData
      .map((row) => {
        const medicine: Medicine = {
          name:
            row['Name'] ||
            row['name'] ||
            row['MEDICINE NAME'] ||
            row['Medicine Name'] ||
            '',
          packaging:
            row['Packaging'] || row['packaging'] || row['PACKAGING'] || null,
          company:
            row['Company'] ||
            row['company'] ||
            row['MANUFACTURER'] ||
            row['Manufacturer'] ||
            null,
          composition:
            row['Composition'] ||
            row['composition'] ||
            row['COMPOSITION'] ||
            null,
          note: row['Note'] || row['note'] || row['NOTES'] || null,
        };

        // Skip rows without a medicine name
        if (!medicine.name || medicine.name.trim() === '') {
          return null;
        }

        // Clean and standardize the data
        medicine.name = medicine.name.trim();
        if (medicine.packaging) medicine.packaging = medicine.packaging.trim();
        if (medicine.company) medicine.company = medicine.company.trim();
        if (medicine.composition)
          medicine.composition = medicine.composition.trim();
        if (medicine.note) medicine.note = medicine.note.trim();

        return medicine;
      })
      .filter((medicine) => medicine !== null) as Medicine[];
  }
  private showNotification(
    type: 'success' | 'warning' | 'error',
    message: string
  ): void {
    // This is a placeholder - implement with your preferred notification system
    // Examples: NGX-Toastr, Material Snackbar, or custom notification service
    console.log(`[${type}] ${message}`);

    // If using no notification library:
    alert(message);
  }
  private saveMedicinesWithoutDuplicates(medicines: Medicine[]): void {
    if (medicines.length === 0) {
      this.isUploading = false;
      this.showNotification(
        'warning',
        'No valid medicine data found in the Excel file'
      );
      return;
    }

    // First check if any of these medicines already exist in the database
    const batchImportRequests = from(medicines).pipe(
      mergeMap((medicine) => {
        // For each medicine, check if it already exists in the database
        // This assumes you have a method to check for duplicates by some unique identifier
        // like name or code
        return this.checkMedicineExists(medicine).pipe(
          map((exists) => ({ medicine, exists }))
        );
      }),
      toArray(),
      map((results) => {
        const newMedicines = results
          .filter((result) => !result.exists)
          .map((result) => result.medicine);
        const duplicates = results.filter((result) => result.exists).length;

        return { newMedicines, duplicates };
      })
    );

    batchImportRequests.subscribe({
      next: ({ newMedicines, duplicates }) => {
        if (newMedicines.length === 0) {
          // All medicines are duplicates
          this.isUploading = false;
          this.result = { added: 0, duplicates };
          this.currentDate = new Date();

          this.showNotification(
            'warning',
            `All medicines (${duplicates}) already exist in the database`
          );
        } else {
          // Save only the non-duplicate medicines
          this.http
            .post<ImportResult>(`${this.apiUrl}/bulk-import`, {
              medicines: newMedicines,
            })
            .subscribe({
              next: (response) => {
                this.result = {
                  added: response.added,
                  duplicates: duplicates + (response.duplicates || 0),
                };
                this.isUploading = false;
                this.currentDate = new Date();

                this.showNotification(
                  'success',
                  `Import completed: ${response.added} medicines added, ${this.result.duplicates} duplicates skipped`
                );
              },
              error: (error) => {
                console.error('Error saving medicines:', error);
                this.isUploading = false;
                this.showNotification(
                  'error',
                  'Failed to save medicines. Please try again.'
                );
              },
            });
        }
      },
      error: (error) => {
        console.error('Error checking for duplicates:', error);
        this.isUploading = false;
        this.showNotification(
          'error',
          'Failed to check for duplicate medicines. Please try again.'
        );
      },
    });
  }

  // Helper method to check if a medicine already exists in the database
  private checkMedicineExists(medicine: Medicine): Observable<boolean> {
    // Modify this to use whatever unique identifier you have for medicines
    // For example, you might check by name, code, or another field
    return this.http.get<boolean>(`${this.apiUrl}/${this.baseUrl}/exists`, {
      params: new HttpParams().set('name', medicine.name),
    });
  } */
}
