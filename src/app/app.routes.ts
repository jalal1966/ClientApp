import { Routes, Router } from '@angular/router';
import { ProductListComponent } from './components/product-list/product-list.component';
import { ProductDetailsComponent } from './components/product-details/product-details.component';
import { ProductFormComponent } from './components/product-form/product-form.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { inject } from '@angular/core';
import { AuthService } from './services/auth.service';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent,
  },
  {
    path: 'products',
    component: ProductListComponent,
    canActivate: [
      () => {
        const authService = inject(AuthService);
        const router = inject(Router);

        if (authService.isLoggedIn()) {
          return true;
        }

        router.navigate(['/login']);
        return false;
      },
    ],
  },
  {
    path: 'products/new',
    component: ProductFormComponent,
    canActivate: [
      () => {
        const authService = inject(AuthService);
        const router = inject(Router);

        if (authService.isLoggedIn()) {
          return true;
        }

        router.navigate(['/login']);
        return false;
      },
    ],
  },
  {
    path: 'products/:id',
    component: ProductDetailsComponent,
    canActivate: [
      () => {
        const authService = inject(AuthService);
        const router = inject(Router);

        if (authService.isLoggedIn()) {
          return true;
        }

        router.navigate(['/login']);
        return false;
      },
    ],
  },
  {
    path: 'products/:id/edit',
    component: ProductFormComponent,
    canActivate: [
      () => {
        const authService = inject(AuthService);
        const router = inject(Router);

        if (authService.isLoggedIn()) {
          return true;
        }

        router.navigate(['/login']);
        return false;
      },
    ],
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  {
    path: '**', // Catch-all route for 404
    redirectTo: '/login',
  },
];
