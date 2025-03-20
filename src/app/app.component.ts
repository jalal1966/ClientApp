import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { RefreshService } from './services/refresh.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="container">
      <header
        class="d-flex flex-wrap justify-content-center py-3 mb-4 border-bottom"
      >
        <a
          href="/"
          class="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-dark text-decoration-none"
        >
          <span class="fs-5">Doctor's Clinic Demo Program</span>
        </a>
      </header>
      <main>
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [],
})
export class AppComponent {
  title = 'Angular Standalone + C# .NEt8.0 + MSSQL Demo';
  constructor(private rfresh: RefreshService) {}
  ngOnInit(): void {
    // Clear localStorage when the application starts
    localStorage.clear();
    console.log('localStorage has been cleared.');
    this.rfresh.checkForRefresh();
  }
}
