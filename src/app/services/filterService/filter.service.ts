import { Injectable } from '@angular/core';
import { Appointment } from '../../models/appointment.model';
import { WaitingPatient } from '../../models/waiting.model';
import { Patients } from '../../models/patient.model';

@Injectable({
  providedIn: 'root',
})
export class FilterService {
  private waitingPatient: WaitingPatient[] = [];
  private appointments: Appointment[] = [];
  private patients: Patients[] = [];
  private selectedStatus: string = 'All';

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
    this.selectedStatus = status;
  }

  // Method with function overloading for filtering by status
  filterStatuses(type: 'waiting'): WaitingPatient[];
  filterStatuses(type: 'appointments'): Appointment[];
  filterStatuses(
    type: 'waiting' | 'appointments'
  ): WaitingPatient[] | Appointment[] {
    if (type === 'waiting') {
      if (!this.waitingPatient || this.waitingPatient.length === 0) {
        console.warn('No waiting patients found');
        return [];
      }

      const filteredPatients =
        this.selectedStatus === 'All'
          ? this.waitingPatient
          : this.waitingPatient.filter(
              (patient) =>
                patient.appointment &&
                patient.appointment.status === this.selectedStatus
            );

      console.log('Filtered Waiting Patients:', filteredPatients); // Debugging line
      return filteredPatients;
    } else {
      if (!this.appointments || this.appointments.length === 0) {
        console.warn('No appointments found');
        return [];
      }

      const filteredAppointments =
        this.selectedStatus === 'All'
          ? this.appointments
          : this.appointments.filter(
              (appointment) => appointment.status === this.selectedStatus
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
