import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { WaitingPatient } from '../../../models/waiting.model';
import { Appointment } from '../../../models/appointment.model';
import { AppointmentService } from '../../../services/appointment/appointment.service';
import { AppointmentStatus } from '../../../models/enums.model';
import { StatusFilterComponent } from '../shared/status-filter/status-filter.component';
import { FilterService } from '../../../services/filterService/filter.service';

@Component({
  selector: 'app-waiting-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, StatusFilterComponent],
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

  appointmentStatuses = [
    { value: AppointmentStatus.Scheduled, label: 'Scheduled' },
    { value: AppointmentStatus.Confirmed, label: 'Confirmed' },
    { value: AppointmentStatus.Waiting, label: 'Waiting' },
    { value: AppointmentStatus.InProgress, label: 'InProgress' },
    { value: AppointmentStatus.Completed, label: 'Completed' },
    { value: AppointmentStatus.CheckedIn, label: 'Checked In' },
    { value: AppointmentStatus.Cancelled, label: 'Cancelled' },
    { value: AppointmentStatus.NoShow, label: 'NoShow' },
  ];

  constructor(
    private filterService: FilterService,
    private appointmentService: AppointmentService,
    private fb: FormBuilder
  ) {
    this.filterService.setWaitingPatients(this.waitingPatient);
  }

  ngOnInit(): void {
    this.loadWaitingList();

    // Refresh every minute to update wait times
    this.refreshInterval = setInterval(() => {
      this.updateWaitTimes();
      this.loadWaitingList();
    }, 60000);
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }
  updateStatus(
    patientOrId: WaitingPatient | number,
    newStatus: 'InProgress' | 'Completed' | 'Cancelled' | 'NoShow'
  ): void {
    let appointmentId: number | undefined;

    // Determine the appointment ID based on input type
    if (typeof patientOrId === 'number') {
      appointmentId = patientOrId;
    } else if ('appointment' in patientOrId) {
      appointmentId = patientOrId.appointment.id;
      patientOrId.appointment!.status = newStatus; // Update status for UI
    }

    if (appointmentId !== undefined) {
      const statusValue = this.findAppointmentStatus(newStatus);
      console.log(
        `Updating status to ${newStatus} for appointment ID: ${appointmentId}`
      );
      this.doUpdateStatus(appointmentId, statusValue.toString());
    } else {
      console.error('Invalid appointment data!');
    }
  }
  findAppointmentStatus(status: string): AppointmentStatus | 'Not Found' {
    return (
      this.appointmentStatuses.find((item) => item.label === status)?.value ||
      'Not Found'
    );
  }
  // to delete
  // do update
  doUpdateStatus(value1: number | undefined, value2: string): void {
    this.appointmentService.updateAppointmentStatus(value1!, value2).subscribe({
      next: () => {
        // Reload UI data
        // this.loadAppointments();
        this.loadWaitingList();
        // this.loadDoctors();
      },
      error: (err: any) => {
        console.error('Error updating status:', err);
      },
    });
  }

  onStatusChange(status: string) {
    this.filterService.setSelectedStatus(status);
    // Get filtered waiting patients
    const waitingPatients = this.filterService.filterStatuses('waiting');
    // Or get filtered appointments
    // const appointments = this.filterService.filterStatuses('appointments');
    return waitingPatients;
  }
  loadWaitingList(): void {
    this.loading = true;
    const today = new Date();
    const tomorrow = new Date();
    this.selectedStatus = 'All';
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
              app.status !== 'NoShow'
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
          this.filterService.setWaitingPatients(this.waitingPatient);
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
        patient.appointment &&
        (patient.appointment.status === 'Waiting' ||
          patient.appointment.status === 'InProgress')
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
