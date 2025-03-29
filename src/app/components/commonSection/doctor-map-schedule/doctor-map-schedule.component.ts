import { Component, Input, OnInit } from '@angular/core';
import { DaySchedule } from '../../../models/appointment.model';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-doctor-map-schedule',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './doctor-map-schedule.component.html',
  styleUrl: './doctor-map-schedule.component.scss',
})
export class DoctorMapScheduleComponent implements OnInit {
  @Input() doctorName: string = 'John Doe';

  schedule: DaySchedule[] = [];

  ngOnInit() {
    // Generate sample schedule
    this.generateSampleSchedule();
  }

  generateSampleSchedule() {
    const today = new Date();
    this.schedule = [0, 1, 2, 3, 4].map((offset) => {
      const date = new Date(today);
      date.setDate(today.getDate() + offset);

      return {
        date: date,
        slots: [
          {
            startTime: '08:00',
            endTime: '09:00',
            status: 'available',
          },
          {
            startTime: '09:00',
            endTime: '10:00',
            status: 'booked',
            patient: 'Emma Smith',
          },
          {
            startTime: '10:00',
            endTime: '11:00',
            status: 'available',
          },
          {
            startTime: '11:00',
            endTime: '12:00',
            status: 'unavailable',
          },
          {
            startTime: '13:00',
            endTime: '14:00',
            status: 'booked',
            patient: 'Michael Johnson',
          },
          {
            startTime: '14:00',
            endTime: '15:00',
            status: 'available',
          },
        ],
      };
    });
  }
}
