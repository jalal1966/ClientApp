import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { WaitingPatient } from '../../../models/waiting.model';
import { Appointment } from '../../../models/appointment.model';
import { AppointmentService } from '../../../services/appointment/appointment.service';

@Component({
  selector: 'app-waiting-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './waiting-list.component.html',
  styleUrls: ['./waiting-list.component.scss'],
})
export class WaitingListComponent implements OnInit, OnDestroy {
  waitingPatient: WaitingPatient[] = [];
  appointments: Appointment[] = [];
  currentDate: Date = new Date();
  loading = false;
  error: string | null = null;
  refreshInterval: any;
  selectedStatus: string = 'all';

  constructor(
    private appointmentService: AppointmentService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
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
    //if (!this.providerId) return;

    this.loading = true;
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    // Format dates as ISO strings for the API call
    const formattedStartDate = today.toISOString();
    const formattedEndDate = tomorrow.toISOString();

    this.appointmentService
      .getAppointmentsByDateRange(formattedStartDate, formattedEndDate)
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

          console.log('Filtered appointments:', todaysAppointments);

          // Map appointments to waiting patients
          this.waitingPatient = todaysAppointments.map((app) => ({
            appointment: app,
            arrivalTime: new Date(app.startTime),
            waitTime: this.calculateWaitTime(new Date(app.startTime)),
            status: 'waiting', // Default status
            patientFirstName: app.patientFirstName || '', // Access directly from appointment
            patientLastName: app.patientLastName || '', // Access directly from appointment
          }));

          console.log('Waiting patients created:', this.waitingPatient);
          this.updateWaitTimes();
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
    return diffInMinutes > 0 ? diffInMinutes : 0;
  }

  updateWaitTimes(): void {
    const now = new Date();
    this.waitingPatient.forEach((patient) => {
      if (
        patient.appointment.status === 'waiting' ||
        patient.appointment.status === 'in-progress'
      ) {
        patient.waitTime = this.calculateWaitTime(patient.arrivalTime);
      }
    });
  }

  changeStatus(
    patient: WaitingPatient,
    newStatus: 'in-progress' | 'completed' | 'no-show'
  ): void {
    patient.appointment.status = newStatus;

    // Update the appointment status in the backend
    this.appointmentService
      .updateAppointmentStatus(patient.appointment.id, newStatus)
      .subscribe({
        next: () => {
          console.log(
            `Status updated to ${newStatus} for patient ${patient.patientFirstName}`
          );
        },
        error: (err: any) => {
          console.error('Failed to update status:', err);
          // Revert the status change in case of error
          patient.appointment.status =
            patient.appointment.status === newStatus
              ? 'waiting'
              : patient.appointment.status;
        },
      });
  }

  filterPatients(): WaitingPatient[] {
    console.log('Selected status:', this.selectedStatus);
    const filtered =
      this.selectedStatus === 'all'
        ? this.waitingPatient
        : this.waitingPatient.filter(
            (patient) => patient.appointment.status === this.selectedStatus
          );
    console.log('Filtered patients:', filtered);
    return filtered;
  }

  // Helper method to manually check in a patient who has arrived
  checkInPatient(patient: WaitingPatient): void {
    patient.arrivalTime = new Date();
    patient.waitTime = 0;
    patient.appointment.status = 'waiting';
  }
}
