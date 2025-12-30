import {
  Routes,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { LoginComponent } from './components/commonSection/login/login.component';
import { RegisterComponent } from './components/commonSection/register/register.component';
import { ForgotPasswordComponent } from './components/commonSection/forgot-password/forgot-password.component';
import { AppointmentComponent } from './components/commonSection/appointment/appointment.component';
import { WaitingListComponent } from './components/commonSection/waiting-list/waiting-list.component';
import { NursePageComponent } from './components/nursingSection/nurse-page/nurse-page.component';
import { ClinicDashboardComponent } from './components/managementSection/clinic-dashboard/clinic-dashboard.component';
import { TaskDashboardComponent } from './components/nursingSection/task-dashboard/task-dashboard.component';
import { AuthGuard } from './services/authGuard/auth-guard.service';
import { AdministratorComponent } from './components/adminSection/administrator/administrator.component';
import { RoleGuard } from './services/roleGuard/role-guard.service';
import { DoctorPageComponent } from './components/doctorsSection/doctor-page/doctor-page.component';
import { PatientListComponent } from './components/patientsSection/patient-list/patient-list.component';
import { DoctorMapScheduleComponent } from './components/commonSection/doctor-map-schedule/doctor-map-schedule.component';
import { UsersListComponent } from './components/adminSection/usersList/users-list/users-list.component';
import { MapComponent } from './components/commonSection/map/map.component';
import { PatientFormComponent } from './components/patientsSection/patient-form/patient-form.component';
import { MedicalRecordsComponent } from './components/patientsSection/medical-records/medical-records.component';
import { PatientAllergiesComponent } from './components/patientsSection/patient-allergies/patient-allergies.component';
import { PatientInfoComponent } from './components/patientsSection/patient-info/patient-info.component';
import { PatientLabResultsComponent } from './components/patientsSection/patient-lab-results/patient-lab-results.component';
import { PatientMedicationsComponent } from './components/patientsSection/patient-medications/patient-medications.component';
import { PatientVisitComponent } from './components/patientsSection/patient-visits/patient-visits.component';
import { PatientDetailComponent } from './components/patientsSection/patient-detail/patient-detail.component';
import { BloodPressureComponent } from './components/patientsSection/blood-pressure/blood-pressure.component';
import { PatientRecordComponent } from './components/patientsSection/patient-record/patient-record.component';
import { MergedPatientComponent } from './components/patientsSection/mergedPatient/merged-patient.component';
import { VitalSignsComponent } from './components/patientsSection/vital-signs/vital-signs.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'appointments', component: AppointmentComponent },
  { path: 'waitingList', component: WaitingListComponent },
  { path: 'nurse', component: NursePageComponent },
  { path: 'management', component: ClinicDashboardComponent },
  { path: 'task-dashboard', component: TaskDashboardComponent },
  { path: 'doctor-map', component: DoctorMapScheduleComponent },
  { path: 'usersList', component: UsersListComponent },
  { path: 'doctor-schedule', component: MapComponent },

  { path: 'patients', component: PatientListComponent }, // List of patients

  // ⭐ MOVE ALL SPECIFIC ROUTES BEFORE THE GENERIC :id ROUTE
  { path: 'patients/:id/vital-signs', component: VitalSignsComponent },

  { path: 'patients/:id/medical-records', component: MedicalRecordsComponent },
  { path: 'patients/:id/allergies', component: PatientAllergiesComponent },
  { path: 'patients/:id/medications', component: PatientMedicationsComponent },
  { path: 'patients/:id/lab-results', component: PatientLabResultsComponent },

  // ⭐ GENERIC ROUTE GOES LAST
  { path: 'patients/:id', component: PatientInfoComponent }, // Patient details page

  { path: 'visits/:id', component: PatientVisitComponent },
  { path: 'visits', component: PatientVisitComponent },
  { path: 'patient-detail/:id', component: PatientDetailComponent },
  { path: 'patient/edit/:id', component: PatientDetailComponent },
  { path: 'pressur/:id', component: BloodPressureComponent },
  { path: 'patientRecord/:id', component: PatientRecordComponent },
  { path: 'merge/:id', component: MergedPatientComponent },

  {
    path: 'admin',
    component: AdministratorComponent,
    canActivate: [RoleGuard],
    data: { roleId: 0 },
  },
  {
    path: 'doctor',
    component: DoctorPageComponent,
    canActivate: [RoleGuard],
    data: { roleId: 1 },
  },
  {
    path: 'nurse',
    component: NursePageComponent,
    canActivate: [RoleGuard],
    data: { roleId: 2 },
  },
  {
    path: 'patient-form',
    component: PatientFormComponent,
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }, // Wildcard route for a 404 page
];
