import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Allergy } from '../../../models/medicalRecord.model';
import { PatientComponentBase } from '../../../shared/base/patient-component-base';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-patient-allergies',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './patient-allergies.component.html',
  styleUrl: './patient-allergies.component.scss',
})
export class PatientAllergiesComponent
  extends PatientComponentBase
  implements OnInit
{
  allergyForm: FormGroup;
  isEditing = false;
  currentAllergyId?: number;
  @Input() allergies: Allergy[] = [];

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    authService: AuthService,
    router: Router,
    private fb: FormBuilder
  ) {
    super(authService, router);
    this.patientId = 0;
    this.allergyForm = this.fb.group({
      allergyType: ['', Validators.required],
      name: ['', Validators.required],
      reaction: ['', Validators.required],
      severity: ['', Validators.required],
      dateIdentified: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    console.log(
      `PatientAllergiesComponent initialized with patientId: ${this.patientId}`
    );
    console.log(`Allergies count: ${this.allergies.length}`);
    this.route.parent?.params.subscribe((params) => {
      this.patientId = +params['id'];
      this.loadAllergies();
    });
  }

  loadAllergies(): void {
    this.http
      .get<Allergy[]>(`api/patients/${this.patientId}/allergies`)
      .subscribe({
        next: (data) => {
          this.allergies = data;
        },
        error: (error) => {
          console.error('Error loading allergies:', error);
        },
      });
  }

  saveAllergy(): void {
    if (this.allergyForm.invalid) {
      return;
    }

    const allergyData: Allergy = {
      patientId: this.patientId,
      allergyType: this.allergyForm.value.allergyType,
      name: this.allergyForm.value.name,
      reaction: this.allergyForm.value.reaction,
      severity: this.allergyForm.value.severity,
      dateIdentified: this.allergyForm.value.dateIdentified,
    };

    if (this.isEditing && this.currentAllergyId) {
      // Update existing allergy
      allergyData.id = this.currentAllergyId;
      this.http
        .put(
          `api/patients/${this.patientId}/allergies/${this.currentAllergyId}`,
          allergyData
        )
        .subscribe({
          next: () => {
            this.loadAllergies();
            this.resetForm();
          },
          error: (error) => {
            console.error('Error updating allergy:', error);
          },
        });
    } else {
      // Create new allergy
      this.http
        .post<Allergy>(`api/patients/${this.patientId}/allergies`, allergyData)
        .subscribe({
          next: () => {
            this.loadAllergies();
            this.resetForm();
          },
          error: (error) => {
            console.error('Error creating allergy:', error);
          },
        });
    }
  }

  editAllergy(allergy: Allergy): void {
    this.isEditing = true;
    this.currentAllergyId = allergy.id;

    this.allergyForm.patchValue({
      allergyType: allergy.allergyType,
      name: allergy.name,
      reaction: allergy.reaction,
      severity: allergy.severity,
      dateIdentified: this.formatDateForInput(allergy.dateIdentified),
    });
  }

  deleteAllergy(id?: number): void {
    if (!id) return;

    if (confirm('Are you sure you want to delete this allergy?')) {
      this.http
        .delete(`api/patients/${this.patientId}/allergies/${id}`)
        .subscribe({
          next: () => {
            this.loadAllergies();
            if (this.currentAllergyId === id) {
              this.resetForm();
            }
          },
          error: (error) => {
            console.error('Error deleting allergy:', error);
          },
        });
    }
  }

  cancelEdit(): void {
    this.resetForm();
  }

  resetForm(): void {
    this.isEditing = false;
    this.currentAllergyId = undefined;
    this.allergyForm.reset();
  }

  private formatDateForInput(date: Date): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }
}
