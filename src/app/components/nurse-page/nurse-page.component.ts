import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-nursepage',
  imports: [CommonModule, RouterModule],
  templateUrl: './nurse-page.component.html',
  styleUrl: './nurse-page.component.scss',
})
export class NursePageComponent {
  public curntUser!: User;
  private authService!: AuthService;
  private router!: Router;
  loginForm!: FormGroup;
  sections = [
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

  onAction(action: string) {
    console.log(`${action} clicked`);
    // Implement navigation or logic for each button click
  }
  ngOnInit(): void {}
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  constructor(authService: AuthService, router: Router) {
    this.curntUser = authService.currentUserValue ?? ({} as User);
    this.authService = authService;
    this.router = router;
  }
  // convenience getter for easy access to form fields
  get f() {
    return this.loginForm.controls;
  }
}
