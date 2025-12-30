import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Location } from '@angular/common';
import { VitalSignsService } from '../../../services/vital-signs-service';
import {
  VitalSigns,
  CreateVitalSigns,
  UpdateVitalSigns,
} from '../../../models/vital-signs.model';

@Component({
  selector: 'app-vital-signs',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './vital-signs.component.html',
  styleUrls: ['./vital-signs.component.scss'],
})
export class VitalSignsComponent implements OnInit {
  vitalSignsForm!: FormGroup;
  patientId!: number;
  loading = false;
  error = '';
  successMessage = '';
  recentVitalSigns: VitalSigns[] = [];
  allVitalSigns: VitalSigns[] = [];
  showFullHistory = false;

  // Pagination for full history
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private vitalSignsService: VitalSignsService
  ) {}

  ngOnInit(): void {
    this.patientId = Number(this.route.snapshot.paramMap.get('id'));
    this.initializeForm();
    this.loadRecentVitalSigns();
  }

  initializeForm(): void {
    this.vitalSignsForm = this.fb.group({
      temperature: [
        '',
        [Validators.required, Validators.min(35), Validators.max(42)],
      ],
      bloodPressureSystolic: [
        '',
        [Validators.required, Validators.min(70), Validators.max(200)],
      ],
      bloodPressureDiastolic: [
        '',
        [Validators.required, Validators.min(40), Validators.max(130)],
      ],
      heartRate: [
        '',
        [Validators.required, Validators.min(40), Validators.max(200)],
      ],
      respiratoryRate: [
        '',
        [Validators.required, Validators.min(8), Validators.max(40)],
      ],
      oxygenSaturation: [
        '',
        [Validators.required, Validators.min(70), Validators.max(100)],
      ],
      weight: ['', [Validators.min(1), Validators.max(300)]],
      remarks: [''],
    });
  }

  loadRecentVitalSigns(): void {
    this.vitalSignsService.getPatientVitalSigns(this.patientId).subscribe({
      next: (data) => {
        this.allVitalSigns = data;
        this.recentVitalSigns = data.slice(0, 5); // Get last 5 records
        this.totalPages = Math.ceil(data.length / this.itemsPerPage);
      },
      error: (err) => {
        console.error('Failed to load vital signs history', err);
      },
    });
  }

  get paginatedVitalSigns(): VitalSigns[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.allVitalSigns.slice(startIndex, endIndex);
  }

  onSubmit(): void {
    if (this.vitalSignsForm.invalid) {
      this.error = 'Please fill in all required fields with valid values.';
      return;
    }

    this.loading = true;
    this.error = '';
    this.successMessage = '';

    const vitalSigns: VitalSigns = {
      patientId: this.patientId,
      temperature: this.vitalSignsForm.value.temperature,
      bloodPressureSystolic: this.vitalSignsForm.value.bloodPressureSystolic,
      bloodPressureDiastolic: this.vitalSignsForm.value.bloodPressureDiastolic,
      heartRate: this.vitalSignsForm.value.heartRate,
      respiratoryRate: this.vitalSignsForm.value.respiratoryRate,
      oxygenSaturation: this.vitalSignsForm.value.oxygenSaturation,
      weight: this.vitalSignsForm.value.weight || undefined,
      recordedAt: new Date(),
      remarks: this.vitalSignsForm.value.remarks || undefined,
      status: '',
    };

    this.vitalSignsService.recordVitalSigns(vitalSigns).subscribe({
      next: (response) => {
        this.successMessage = 'Vital signs recorded successfully!';
        this.loading = false;
        this.vitalSignsForm.reset();
        this.loadRecentVitalSigns();

        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (err) => {
        this.error = 'Failed to record vital signs. Please try again.';
        this.loading = false;
      },
    });
  }

  getVitalSignStatus(vitalSign: VitalSigns): string {
    // Blood Pressure Status
    if (
      vitalSign.bloodPressureSystolic >= 140 ||
      vitalSign.bloodPressureDiastolic >= 90
    ) {
      return 'High BP';
    }
    if (
      vitalSign.bloodPressureSystolic < 90 ||
      vitalSign.bloodPressureDiastolic < 60
    ) {
      return 'Low BP';
    }

    // Temperature Status
    if (vitalSign.temperature > 38) {
      return 'Fever';
    }
    if (vitalSign.temperature < 36) {
      return 'Hypothermia';
    }

    // Oxygen Saturation
    if (vitalSign.oxygenSaturation < 95) {
      return 'Low O2';
    }

    return 'Normal';
  }

  goBack(): void {
    this.location.back();
  }

  viewFullHistory(): void {
    this.showFullHistory = !this.showFullHistory;
    if (this.showFullHistory) {
      this.currentPage = 1; // Reset to first page when opening
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
  }
}
