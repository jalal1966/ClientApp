import { ApplicationConfig } from '@angular/core';

import { provideRouter, withDebugTracing } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes, withDebugTracing()), provideHttpClient()],
};
