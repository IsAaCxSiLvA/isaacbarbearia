import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { LoginComponent } from './admin/login.component';
import { AdminComponent } from './admin/admin.component';

export const routes: Routes = [
  { path: '', component: AppComponent },
  { path: 'admin/login', component: LoginComponent },
  { path: 'admin', component: AdminComponent },
  { path: '**', redirectTo: '' }
];
