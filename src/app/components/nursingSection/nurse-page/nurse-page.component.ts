import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { User } from '../../../models/user';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-nursepage',
  imports: [CommonModule, RouterModule],
  templateUrl: './nurse-page.component.html',
  styleUrl: './nurse-page.component.scss',
})
export class NursePageComponent {
  public curntUserToSave!: User;
  public curntUser!: User;
  isPatientFormVisible = false;
  isaddPatientFormVisible = false;
  private authService!: AuthService;
  private router!: Router;
  loginForm!: FormGroup;
  sections = [
    {
      title: 'View Patients',
      description: 'Patient records and biographies',
      buttonText: 'View Patients',
      action: 'View Patients',
    },
    {
      title: 'Patient Care',
      description: 'Manage patient care tasks',
      buttonText: 'View Tasks',
      action: 'viewTasks',
    },
    {
      title: 'Vital Signs',
      description: 'Record patient vital signs',
      buttonText: 'Record Vitals',
      action: 'recordVitals',
    },
    {
      title: 'Medications',
      description: 'Manage medication administration',
      buttonText: 'Medication Log',
      action: 'medicationLog',
    },
  ];

  constructor(authService: AuthService, router: Router) {
    this.curntUser = authService.currentUserValue ?? ({} as User);
    sessionStorage.setItem(
      'savedData',
      JSON.stringify(authService.currentUserValue ?? ({} as User))
    );
    this.authService = authService;
    this.router = router;
  }
  onAction(action: string) {
    console.log(`${action} clicked`);

    // Implement navigation or logic for each button click
    switch (action) {
      case 'View Patients':
        this.navigatePatientsView();
        break;
      case 'viewTasks':
        this.navigateToTasks();
        break;
      case 'recordVitals':
        this.navigateToVitalSigns();
        break;
      case 'medicationLog':
        this.navigateToMedicationLog();
        break;
      default:
        console.warn(`Unhandled action: ${action}`);
    }
  }

  private navigateToTasks() {
    this.router.navigate(['/task-dashboard']);
  }

  private navigateToVitalSigns() {
    this.router.navigate(['/vital-signs']);
  }

  private navigateToMedicationLog() {
    this.router.navigate(['/medication-log']);
  }
  private navigatePatientsView() {
    console.log('showPatientForm method called');
    this.isPatientFormVisible = true;
    console.log('showPatientForm', this.isPatientFormVisible);
    this.router.navigate(['/patients']);
  }

  ngOnInit(): void {}
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  showPatientForm() {
    console.log('showPatientForm method called');
    this.isPatientFormVisible = true;
    console.log('showPatientForm', this.isPatientFormVisible);
    this.router.navigate(['/patients']);
  }
  addPatientForm() {
    console.log('addPatientForm method called');
    this.isaddPatientFormVisible = true;
    console.log('addPatientForm', this.isPatientFormVisible);
    this.router.navigate(['/patient-form']);
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.loginForm.controls;
  }
}
