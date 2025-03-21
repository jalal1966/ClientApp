import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // Check if user is logged in
    const user = this.authService.currentUserValue;
    if (!user) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: state.url },
      });
      return false;
    }

    // Check token expiration
    if (this.authService.isTokenExpired()) {
      this.authService.logout();
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: state.url },
      });
      return false;
    }

    // Check if route has required role
    const requiredRoleId = route.data['roleId'] as number;
    if (requiredRoleId && user.jobTitleId !== requiredRoleId) {
      // User doesn't have required role, redirect to appropriate page
      this.authService.navigateByRole();
      return false;
    }

    return true;
  }
}
