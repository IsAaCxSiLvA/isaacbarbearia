
import { bootstrapApplication } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { RootComponent } from './src/root.component';
import { AppComponent } from './src/app.component';
import { LoginComponent } from './src/admin/login.component';
import { AdminComponent } from './src/admin/admin.component';

const routes = [
  { path: '', component: AppComponent },
  { path: 'admin/login', component: LoginComponent },
  { path: 'admin', component: AdminComponent },
  { path: '**', redirectTo: '' }
];

bootstrapApplication(RootComponent, {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes)
  ]
}).catch(err => console.error(err));

// AI Studio always uses an `index.tsx` file for all project types.
