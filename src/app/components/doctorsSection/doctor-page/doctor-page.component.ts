import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { FormGroup } from '@angular/forms';
import { User } from '../../../models/user';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-doctor-page',
  imports: [CommonModule, RouterModule],
  templateUrl: './doctor-page.component.html',
  styleUrl: './doctor-page.component.scss',
})
export class DoctorPageComponent {
  public curntUser!: User;
  isPatientFormVisible = false;
  loginForm!: FormGroup;
  private authService!: AuthService;
  private router!: Router;
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
  showPatientForm() {
    console.log('showPatientForm method called');
    this.isPatientFormVisible = true;
    console.log('showPatientForm', this.isPatientFormVisible);
    this.router.navigate(['/patient-form']);
  }
  // convenience getter for easy access to form fields
  get f() {
    return this.loginForm.controls;
  }
}
