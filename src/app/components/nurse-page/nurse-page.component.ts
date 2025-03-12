import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
@Component({
  selector: 'app-nursepage',
  imports: [CommonModule, RouterModule],
  templateUrl: './nurse-page.component.html',
  styleUrl: './nurse-page.component.scss',
})
export class NursePageComponent {
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
