import { Injectable } from '@angular/core';
import { differenceInYears } from 'date-fns';

@Injectable({
  providedIn: 'root',
})
export class UtilityService {
  constructor() {}

  getAge(dob: string | Date): number {
    return differenceInYears(new Date(), new Date(dob));
  }
  /* checkForRefresh(): void {
    const navEntry = performance.getEntriesByType(
      'navigation'
    )[0] as PerformanceNavigationTiming;

    if (navEntry?.type === 'reload') {
      this.router.navigateByUrl(this.router.url);
    }
  } */
}
