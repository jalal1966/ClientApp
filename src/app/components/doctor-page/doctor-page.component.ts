import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-doctor-page',
  imports: [CommonModule, RouterModule],
  templateUrl: './doctor-page.component.html',
  styleUrl: './doctor-page.component.scss',
})
export class DoctorPageComponent {}
