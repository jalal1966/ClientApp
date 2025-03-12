import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-doctor-page',
  imports: [CommonModule, RouterModule],
  templateUrl: './doctor-page.component.html',
  styleUrl: './doctor-page.component.scss',
})
export class DoctorPageComponent {
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
