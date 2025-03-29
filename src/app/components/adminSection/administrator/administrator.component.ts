import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-administrator',
  imports: [CommonModule],
  templateUrl: './administrator.component.html',
  styleUrl: './administrator.component.scss',
})
export class AdministratorComponent {
  [x: string]: any;
  appointments = [
    { patient: 'John Doe', doctor: 'Dr. Smith', date: '2025-03-12' },
    { patient: 'Jane Roe', doctor: 'Dr. Adams', date: '2025-03-13' },
  ];
  private authService!: AuthService;
  private router!: Router;
  ngOnInit(): void {}
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  constructor(authService: AuthService, router: Router) {
    this.authService = authService;
    this.router = router;
  }
}
