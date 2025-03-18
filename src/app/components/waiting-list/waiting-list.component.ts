import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AppointmentService } from '../../services/appointment.service';
import { AppointmentDto } from '../../models/appointment.model';

interface WaitingPatient {
  appointment: AppointmentDto;
  arrivalTime: Date;
  waitTime: number; // in minutes
  status: 'waiting' | 'in-progress' | 'completed' | 'no-show';
}

@Component({
  selector: 'app-waiting-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './waiting-list.component.html',
  styleUrls: ['./waiting-list.component.scss'],
})
export class WaitingListComponent implements OnInit, OnDestroy {
  waitingPatients: WaitingPatient[] = [];
  providerId: number | null = null;
  currentDate: Date = new Date();
  loading = false;
  error: string | null = null;
  refreshInterval: any;
  selectedStatus: string = 'all';

  constructor(private appointmentService: AppointmentService) {}

  ngOnInit(): void {
    // Initialize with provider ID 1 for demo purposes
    this.providerId = 1;
    this.loadAppointments();

    // Refresh every minute to update wait times
    this.refreshInterval = setInterval(() => {
      this.updateWaitTimes();
    }, 60000);
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  loadAppointments(): void {
    if (!this.providerId) return;

    this.loading = true;
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    this.appointmentService
      .getAppointmentsByDateRange(today, tomorrow, this.providerId)
      .subscribe({
        next: (appointments) => {
          // Filter to only include today's confirmed appointments
          const todaysAppointments = appointments.filter((app) => {
            const appDate = new Date(app.startTime);
            return (
              appDate.toDateString() === today.toDateString() &&
              app.status !== 'Cancelled' &&
              app.status !== 'No-Show'
            );
          });

          // Map appointments to waiting patients
          this.waitingPatients = todaysAppointments.map((app) => ({
            appointment: app,
            arrivalTime: new Date(app.startTime),
            waitTime: this.calculateWaitTime(new Date(app.startTime)),
            status: 'waiting', // Default status
          }));

          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load appointments. Please try again later.';
          this.loading = false;
        },
      });
  }

  calculateWaitTime(arrivalTime: Date): number {
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - arrivalTime.getTime()) / 60000
    );
    return diffInMinutes;
  }

  updateWaitTimes(): void {
    this.waitingPatients.forEach((patient) => {
      if (patient.status === 'waiting') {
        patient.waitTime = this.calculateWaitTime(patient.arrivalTime);
      }
    });
  }

  changeStatus(
    patient: WaitingPatient,
    newStatus: 'in-progress' | 'completed' | 'no-show'
  ): void {
    patient.status = newStatus;
    // You can also call a service method here to update the status on the server
  }

  filterPatients(): WaitingPatient[] {
    if (this.selectedStatus === 'all') {
      return this.waitingPatients;
    }
    return this.waitingPatients.filter(
      (patient) => patient.status === this.selectedStatus
    );
  }
}
