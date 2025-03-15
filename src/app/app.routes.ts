import {
  Routes,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { ProductListComponent } from './components/product-list/product-list.component';
import { ProductDetailsComponent } from './components/product-details/product-details.component';
import { ProductFormComponent } from './components/product-form/product-form.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { inject } from '@angular/core';
import { AuthService } from './services/auth.service';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { DoctorPageComponent } from './components/doctor-page/doctor-page.component';
import { RoleGuard } from './services/roleguard';
import { NursePageComponent } from './components/nurse-page/nurse-page.component';
import { AuthGuard } from './services/authGuard';
import { AdministratorComponent } from './components/administrator/administrator.component';
import { PatientListComponent } from './components/patient-list/patient-list.component';
import { PatientFormComponent } from './components/patient-form/patient-form.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
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
    component: PatientFormComponent,
  },
  { path: '**', redirectTo: '/login' }, // Wildcard route for a 404 page
];
