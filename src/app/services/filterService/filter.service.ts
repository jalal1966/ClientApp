import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Appointment } from '../../models/appointment.model';
import { WaitingPatient } from '../../models/waiting.model';
import { Patients } from '../../models/patient.model';
import { AppointmentStatus } from '../../models/enums.model';

@Injectable({
  providedIn: 'root',
})
export class FilterService {
  private waitingPatient: WaitingPatient[] = [];
  private appointments: Appointment[] = [];
  private patients: Patients[] = [];

  // Use BehaviorSubject to make status changes observable
  private selectedStatusSubject = new BehaviorSubject<string>('All');
  public selectedStatus$ = this.selectedStatusSubject.asObservable();

  constructor() {}

  // Setter methods to update data
  setWaitingPatients(patients: WaitingPatient[]): void {
    this.waitingPatient = patients;
  }

  setAppointments(appointments: Appointment[]): void {
    this.appointments = appointments;
  }

  setPatients(patients: Patients[]): void {
    this.patients = patients;
  }

  setSelectedStatus(status: string): void {
    this.selectedStatusSubject.next(status);
  }

  getSelectedStatus(): string {
    return this.selectedStatusSubject.value;
  }

  // Convert string status to enum number
  private getStatusEnumValue(statusString: string): number | null {
    if (statusString === 'All') return null;
    return AppointmentStatus[statusString as keyof typeof AppointmentStatus];
  }

  // Method with function overloading for filtering by status
  filterStatuses(type: 'waiting'): WaitingPatient[];
  filterStatuses(type: 'appointments'): Appointment[];
  filterStatuses(
    type: 'waiting' | 'appointments'
  ): WaitingPatient[] | Appointment[] {
    const currentStatus = this.selectedStatusSubject.value;
    const statusEnumValue = this.getStatusEnumValue(currentStatus);

    if (type === 'waiting') {
      if (!this.waitingPatient || this.waitingPatient.length === 0) {
        console.warn('No waiting patients found');
        return [];
      }

      const filteredPatients =
        statusEnumValue === null
          ? this.waitingPatient
          : this.waitingPatient.filter(
              (patient) =>
                patient.appointment &&
                patient.appointment.status === String(statusEnumValue)
            );

      console.log('Filtered Waiting Patients:', filteredPatients);
      console.log(
        'Filter Status:',
        currentStatus,
        '| Enum Value:',
        statusEnumValue
      );
      return filteredPatients;
    } else {
      if (!this.appointments || this.appointments.length === 0) {
        console.warn('No appointments found');
        return [];
      }

      const filteredAppointments =
        statusEnumValue === null
          ? this.appointments
          : this.appointments.filter(
              (appointment) => appointment.status === String(statusEnumValue)
            );

      console.log('Filtered Appointments:', filteredAppointments);
      console.log(
        'Filter Status:',
        currentStatus,
        '| Enum Value:',
        statusEnumValue
      );
      return filteredAppointments;
    }
  }

  // Method for filtering patients by search term
  filterPatientsBySearchTerm(searchTerm: string): Patients[] {
    return this.patients.filter(
      (patient) =>
        patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.lastName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Helper method for components to use with event handling
  filterPatients(event: Event): Patients[] {
    const searchTerm = (event.target as HTMLInputElement).value;
    return this.filterPatientsBySearchTerm(searchTerm);
  }
}
