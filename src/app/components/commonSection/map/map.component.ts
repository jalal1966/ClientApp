// src/app/components/map/map.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import {
  Appointment,
  Provider,
  ScheduleSlot,
} from '../../../models/appointment.model';
import { AppointmentService } from '../../../services/appointment/appointment.service';

@Component({
  selector: 'app-doctor-map',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit {
  appointments: Appointment[] = [];
  providers: Provider[] = [];
  scheduleSlots: ScheduleSlot[] = [];
  loading = true;
  error: string | null = null;

  // Filter options
  selectedDate: string;
  selectedStatus: string = 'all';

  // Time slot configuration
  startHour = 8; // 8 AM
  endHour = 18; // 6 PM
  slotDuration = 30; // minutes

  // Default lunch time (can be customized per provider)
  defaultLunchStart = '12:00';
  defaultLunchEnd = '13:00';

  constructor(
    private appointmentService: AppointmentService,
    private router: Router
  ) {
    // Initialize selected date to today
    const today = new Date();
    this.selectedDate = this.formatDateForInput(today);
  }

  ngOnInit(): void {
    this.getAppointments();
    // In a real app, you would fetch providers from a service
    //this.getMockProviders();
  }

  // Fetch all appointments
  // Modify your getAppointments method to extract providers
  getAppointments(): void {
    this.loading = true;
    this.appointmentService.getAppointments().subscribe({
      next: (appointments) => {
        this.appointments = appointments;

        // Extract unique providers from appointments
        const providerMap = new Map<number, Provider>();

        appointments.forEach((appointment) => {
          if (
            appointment.providerId &&
            !providerMap.has(appointment.providerId)
          ) {
            // Create a Provider object with lunch time defaults
            providerMap.set(appointment.providerId, {
              id: appointment.providerId,
              namePatient: `${appointment.patientFirstName} ${appointment.patientLastName}`,
              name: `Dr. ${appointment.providerFirstName || 'Unknown'} ${
                appointment.providerLastName
              }`,
              // Set default lunch times - you might want to get these from user data if available
              lunchStart: this.defaultLunchStart,
              lunchEnd: this.defaultLunchEnd,
            });
          }
        });

        // Convert map to array
        this.providers = Array.from(providerMap.values());

        // If no providers were found, handle that case
        if (this.providers.length === 0) {
          this.error = 'No providers found in appointments';
          console.warn('No providers found in appointment data');
        }

        this.generateScheduleMap();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load appointments';
        this.loading = false;
        console.error(err);
      },
    });
  }

  // Remove the getMockProviders method since we're getting them from appointments

  // Mock function to get providers - replace with actual service call
  /* getMockProviders(): void {
    // In a real app, you would fetch this data from a service with lunch times
    this.providers = [
      { id: 1, name: 'Dr. Smith', lunchStart: '12:00', lunchEnd: '13:00' },
      { id: 2, name: 'Dr. Johnson', lunchStart: '12:30', lunchEnd: '13:30' },
      { id: 3, name: 'Dr. Williams', lunchStart: '12:00', lunchEnd: '12:30' },
      { id: 4, name: 'Dr. Brown', lunchStart: '13:00', lunchEnd: '14:00' },
    ];
  }*/

  // Helper to convert time string to total minutes
  private timeToMinutes(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Helper to check if time is within lunch hours for a provider
  //isLunchTimeForProvider(time: string | Date, provider: Provider): boolean {
  private isLunchTimeForProvider(timeStr: string, provider: Provider): boolean {
    // If provider doesn't have lunch time defined, use default
    const lunchStart = provider.lunchStart || this.defaultLunchStart;
    const lunchEnd = provider.lunchEnd || this.defaultLunchEnd;

    const timeMinutes = this.timeToMinutes(timeStr);
    const lunchStartMinutes = this.timeToMinutes(lunchStart);
    const lunchEndMinutes = this.timeToMinutes(lunchEnd);

    return timeMinutes >= lunchStartMinutes && timeMinutes < lunchEndMinutes;
  }

  // Generate the schedule map
  generateScheduleMap(): void {
    this.scheduleSlots = [];

    // Filter appointments for selected date
    const dateFilter = new Date(this.selectedDate);
    dateFilter.setHours(0, 0, 0, 0);
    const nextDay = new Date(dateFilter);
    nextDay.setDate(nextDay.getDate() + 1);

    const filteredAppointments = this.appointments.filter((app) => {
      const appDate = new Date(app.startTime);
      return (
        appDate >= dateFilter &&
        appDate < nextDay &&
        (this.selectedStatus === 'all' || app.status === this.selectedStatus)
      );
    });

    // Generate time slots
    const totalSlots =
      ((this.endHour - this.startHour) * 60) / this.slotDuration;

    for (let i = 0; i < totalSlots; i++) {
      const minutes = i * this.slotDuration;
      const hour = Math.floor(minutes / 60) + this.startHour;
      const minute = minutes % 60;

      const timeString = `${hour.toString().padStart(2, '0')}:${minute
        .toString()
        .padStart(2, '0')}`;

      // Create a slot with empty appointments for each provider
      const slot: ScheduleSlot = {
        time: timeString,
        appointments: {},
        isLunchTime: false, // Default to not lunch time
      };

      // Initialize with null for each provider
      this.providers.forEach((provider) => {
        slot.appointments[provider.id] = null;
      });

      this.scheduleSlots.push(slot);
    }

    // Place appointments in slots
    filteredAppointments.forEach((appointment) => {
      const startTime = new Date(appointment.startTime);
      const startHour = startTime.getHours();
      const startMinute = startTime.getMinutes();

      // Only process appointments within our time range
      if (startHour >= this.startHour && startHour < this.endHour) {
        const minutesSinceStart =
          (startHour - this.startHour) * 60 + startMinute;
        const slotIndex = Math.floor(minutesSinceStart / this.slotDuration);

        // Make sure the slot exists
        if (slotIndex >= 0 && slotIndex < this.scheduleSlots.length) {
          // Place the appointment in the correct provider column
          this.scheduleSlots[slotIndex].appointments[appointment.providerId] =
            appointment;
        }
      }
    });

    // Mark lunch time slots for each provider
    this.scheduleSlots.forEach((slot) => {
      this.providers.forEach((provider) => {
        if (
          this.isLunchTimeForProvider(
            this.formatTimeToString(slot.time),
            provider
          )
        ) {
          // If it's lunch time for this provider, mark the slot
          if (slot.appointments[provider.id] === null) {
            // Only mark as lunch if there's no appointment scheduled (appointments take priority)
            slot.appointments[provider.id] = null;
            slot.isLunchTime = true;
          }
        }
      });
    });
  }

  // Date/time formatting helpers
  formatDateForInput(dateValue: string | Date): string {
    if (!dateValue) {
      return '';
    }

    const date =
      typeof dateValue === 'string' ? new Date(dateValue) : dateValue;

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return '';
    }

    // Format date as YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  // Handle date change
  onDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedDate = input.value;
    this.generateScheduleMap();
  }

  // Handle status filter change
  onStatusChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedStatus = select.value;
    this.generateScheduleMap();
  }

  // Get appointment class based on status
  getAppointmentClass(appointment: Appointment | null): string {
    if (!appointment) return '';

    switch (appointment.status) {
      case 'Scheduled':
        return 'bg-primary';
      case 'Completed':
        return 'bg-success';
      case 'Cancelled':
        return 'bg-danger';
      case 'In Progress':
        return 'bg-warning';
      default:
        return 'bg-info';
    }
  }

  // Option 1: Include all required properties
  isLunchTimeCell(slot: ScheduleSlot, providerId: number): boolean {
    return this.isLunchTimeForProvider(
      this.formatTimeToString(slot.time),
      this.providers.find((p) => p.id === providerId) || {
        id: providerId,
        name: 'Unknown',
        lunchStart: this.defaultLunchStart,
        lunchEnd: this.defaultLunchEnd,
      }
    );
  }

  // Navigate to appointment details
  viewAppointment(appointment: Appointment | null): void {
    if (!appointment) return;
    this.router.navigate(['/appointments', appointment.id]);
  }

  formatTimeToString(time: string | Date): string {
    return typeof time === 'string'
      ? time
      : `${time.getHours().toString().padStart(2, '0')}:${time
          .getMinutes()
          .toString()
          .padStart(2, '0')}`;
  }
}
