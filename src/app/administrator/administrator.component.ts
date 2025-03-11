import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-administrator',
  imports: [CommonModule],
  templateUrl: './administrator.component.html',
  styleUrl: './administrator.component.scss',
})
export class AdministratorComponent {
  appointments = [
    { patient: 'John Doe', doctor: 'Dr. Smith', date: '2025-03-12' },
    { patient: 'Jane Roe', doctor: 'Dr. Adams', date: '2025-03-13' },
  ];
}
