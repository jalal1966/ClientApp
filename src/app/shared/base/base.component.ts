import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { User } from '../../models/user';

export abstract class BaseComponent {
  currentUser: User;
  protected authService: AuthService;
  protected router: Router;

  constructor(authService: AuthService, router: Router) {
    this.authService = authService;
    this.router = router;

    this.currentUser = this.authService.currentUserValue ?? ({} as User);
    sessionStorage.setItem('savedData', JSON.stringify(this.currentUser));
  }
}
