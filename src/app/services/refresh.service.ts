import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class RefreshService {
  constructor(private router: Router) {}

  checkForRefresh(): void {
    if (performance.navigation.type === 1) {
      this.router.navigate(['/login']);
    }
  }
}
