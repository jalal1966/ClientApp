import { Component, OnInit } from '@angular/core';
import { Appointment } from '../../models/appointment.model';
import { AppointmentService } from '../../services/appointment/appointment.service';
import { User } from '../../models/user';

@Component({
  selector: 'app-doctor-schedule',
  imports: [],
  templateUrl: './doctor-schedule.component.html',
  styleUrl: './doctor-schedule.component.scss',
})
export class DoctorScheduleComponent implements OnInit {
  viewMode: 'schedule' | 'map' = 'schedule';
  doctors: User[] = [];
  selectedDoctorId: number | null = null;
  appointments: Appointment[] = [];
  doctorId!: number;
  constructor(private appointmentService: AppointmentService) {}

  ngOnInit(): void {
    //this.loadDoctors();
  }

  /*  loadDoctors(): void {
    this.appointmentService.getAppointmentsByProvider(this.doctorId).subscribe({
      next: (doctors) => {
        this.appointments = doctors;
        if (this.appointments.length > 0) {
          this.selectedDoctorId = doctors[0].userID;
          this.loadDoctorAppointments();
        }
      },
      error: (err) => {
        console.error('Error loading doctors', err);
      }
    });
  }

   loadDoctorAppointments(): void {
    if (!this.selectedDoctorId) return;

    this.appointmentService.getDoctorAppointments(this.selectedDoctorId).subscribe({
      next: (appointments) => {
        this.appointments = appointments;
        this.selectedDoctor = this.doctors.find(d => d.userID === this.selectedDoctorId) || null;
        
        if (this.viewMode === 'map') {
          this.initializeMap();
        }
      },
      error: (err) => {
        console.error('Error loading appointments', err);
      }
    });
  } 

  initializeMap(): void {
    if (!this.selectedDoctor) return;

    // Placeholder for map initialization
    // In a real app, you'd use Google Maps, Mapbox, or another mapping service
    const mapElement = document.getElementById('doctorMap');
    if (mapElement) {
      mapElement.innerHTML = `Placeholder for map showing location of Dr. ${this.selectedDoctor.firstName} ${this.selectedDoctor.lastName}`;
    }
  }*/
}
