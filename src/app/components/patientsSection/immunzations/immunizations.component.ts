import { Component, inject, Input, input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormsModule } from '@angular/forms';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Immunization } from '../../../models/medicalRecord.model';
import { PatientComponentBase } from '../../../shared/base/patient-component-base';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { PatientLabResultsService } from '../../../services/patient-lab-results/patient-lab-results.service';

@Component({
  selector: 'app-immunizations',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbModule],
  templateUrl: './immunizations.component.html',
  styleUrls: ['./immunizations.component.scss'],
})
export class ImmunizationsComponent
  extends PatientComponentBase
  implements OnInit
{
  private http = inject(HttpClient);
  private modalService = inject(NgbModal);

  @Input() immunizations: Immunization[] = [];

  selectedImmunization: any = null;
  newImmunization = {
    vaccineName: '',
    administrationDate: '',
    lotNumber: '',
    administeringProvider: '',
    nextDoseDate: '',
    manufacturer: '',
  };
  constructor(
    private route: ActivatedRoute,
    authService: AuthService,
    router: Router,
    private labResultsService: PatientLabResultsService,
    private fb: FormBuilder
  ) {
    super(authService, router);
  }
  ngOnInit(): void {
    this.getImmunizations();
  }

  getImmunizations() {
    this.http
      .get<any[]>(`/api/patients/${this.patientId}/immunizations`)
      .subscribe((data) => (this.immunizations = data));
  }

  openModal(content: any, immunization: any = null) {
    this.selectedImmunization = immunization;
    if (immunization) {
      this.newImmunization = { ...immunization };
    } else {
      this.newImmunization = {
        vaccineName: '',
        administrationDate: '',
        lotNumber: '',
        administeringProvider: '',
        nextDoseDate: '',
        manufacturer: '',
      };
    }
    this.modalService.open(content, { centered: true });
  }

  saveImmunization(modalRef: any) {
    if (this.selectedImmunization) {
      // Update
      this.http
        .put(
          `/api/patients/${this.patientId}/immunizations/${this.selectedImmunization.id}`,
          {
            ...this.newImmunization,
            patientId: this.patientId,
            id: this.selectedImmunization.id,
          }
        )
        .subscribe(() => {
          this.getImmunizations();
          modalRef.close();
        });
    } else {
      // Create
      this.http
        .post(`/api/patients/${this.patientId}/immunizations`, {
          ...this.newImmunization,
        })
        .subscribe(() => {
          this.getImmunizations();
          modalRef.close();
        });
    }
  }

  deleteImmunization(id: number) {
    if (confirm('Are you sure you want to delete this immunization?')) {
      this.http
        .delete(`/api/patients/${this.patientId}/immunizations/${id}`)
        .subscribe(() => this.getImmunizations());
    }
  }
}
