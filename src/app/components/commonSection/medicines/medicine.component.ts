import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpParams } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { from, map, mergeMap, Observable, toArray } from 'rxjs';
import * as XLSX from 'xlsx';
import { ImportResult, Medicine } from '../../../models/medicalRecord.model';
import { environment } from '../../../../environments/environment';
import { MedicineService } from '../../../services/medicine/medicine.service';
import { Location } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-medicine',
  imports: [CommonModule, RouterModule, HttpClientModule, ReactiveFormsModule],
  templateUrl: './medicine.component.html',
  styleUrl: './medicine.component.scss',
})
export class MedicineComponent implements OnInit {
  medicineForm!: FormGroup;

  @Input() isMainForm: boolean = true;
  medicines$!: Observable<Medicine[]>;
  selectedFile: File | null = null;
  isUploading = false;
  result: ImportResult = { added: 0, duplicates: 0 };
  apiUrl = environment.apiUrl; // Replace
  baseUrl = '/api/Medicines/bulk-import';
  currentDate = new Date();
  fileName = '';
  ////////////////////////
  showFormExcel: boolean = false;
  showForm: boolean = false;
  isEditing = false;
  filteredMedicines: Medicine[] = [];
  medicine: Medicine[] = [];
  loading = true;
  error = '';
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private medicineService: MedicineService,
    private http: HttpClient,
    private location: Location
  ) {
    this.initForm();
  }

  initForm() {
    this.medicineForm = this.fb.group({
      name: ['', [Validators.required]],
      packaging: ['', [Validators.required]],
      company: ['', [Validators.required]],
      composition: ['', [Validators.required]],
      note: [''],
    });
  }

  ngOnInit(): void {
    this.loadMedicines();
  }

  loadMedicines(): void {
    this.loading = true;
    this.medicineService.getMedicines().subscribe({
      next: (data) => {
        this.medicine = data;
        this.filteredMedicines = data;
        this.loading = false;
        this.errorMessage = null;
        if (this.isMainForm) {
          this.successMessage = 'Download Medicine successfully';
          setTimeout(() => (this.successMessage = null), 3000);
        }
      },
      error: (error) => {
        this.error = 'Failed to load Medicines. Please try again.';
        this.loading = false;
        this.successMessage = null;
        this.errorMessage =
          'Failed to load Medicines. Please try again.' +
          (error.message || 'Unknown error');
        setTimeout(() => (this.errorMessage = null), 3000);
      },
    });
  }

  submitForm(): void {
    if (this.medicineForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.medicineForm.controls).forEach((key) => {
        this.medicineForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const formData = this.medicineForm.value;
    const medicine: Medicine = {
      ...formData,
    };

    if (this.isEditing) {
      this.medicineService.updateMedicine(medicine).subscribe({
        next: () => {
          this.cancelEdit();
          if (this.isMainForm) {
            this.successMessage = 'Medicine updated successfully';
            setTimeout(() => (this.successMessage = null), 3000);
            this.loadMedicines();
          }
          this.showForm = false;
        },
        error: (error) => {
          this.errorMessage =
            'Failed to update medicine: ' + (error.message || 'Unknown error');
          this.loading = false;
        },
      });
    } else {
      this.medicineService.createMedicine(medicine).subscribe({
        next: () => {
          this.medicineForm.reset();
          this.successMessage = 'New medicine added successfully';
          setTimeout(() => (this.successMessage = null), 3000);
          this.loadMedicines();
          this.showForm = false;
        },
        error: (error) => {
          this.errorMessage =
            'Failed to create medicine: ' + (error.message || 'Unknown error');
          this.loading = false;
        },
      });
      this.showForm = false;
    }
  }

  openFormExcel() {
    this.showFormExcel = true;
    // Reset the form if needed
    if (this.isEditing) {
      this.cancelEditExcel();
    }
  }
  cancelEditExcel(): void {
    this.isEditing = false;
    this.fileName = '';
    this.showFormExcel = false; // Hide the form when canceling
  }

  openForm() {
    this.showForm = true;
    // Reset the form if needed
    if (this.isEditing) {
      this.cancelEditExcel();
    }
  }
  cancelEdit(): void {
    this.isEditing = false;
    this.showForm = false; // Hide the form when canceling
  }

  filterMedicine(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredMedicines = this.medicine.filter(
      (med) =>
        med.name.toLowerCase().includes(searchTerm) ||
        med.company?.toLowerCase().includes(searchTerm)
    );
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

  backClicked() {
    this.location.back();
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
