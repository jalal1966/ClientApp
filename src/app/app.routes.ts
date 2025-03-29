import {
  Routes,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { ProductListComponent } from './components/product-list/product-list.component';
import { ProductDetailsComponent } from './components/product-details/product-details.component';
import { ProductFormComponent } from './components/product-form/product-form.component';
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
  {
    path: 'products',
    component: ProductListComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'products/new',
    component: ProductFormComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'products/:id',
    component: ProductDetailsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'products/:id/edit',
    component: ProductFormComponent,
    canActivate: [AuthGuard],
  },
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
  // TODO: Add a route for the administrator page
  {
    path: 'patients',
    component: PatientListComponent,
  },
  {
    path: 'patient-form',
    component: PatientListComponent,
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }, // Wildcard route for a 404 page
];
