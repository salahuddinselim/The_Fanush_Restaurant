import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./public/home/home.component').then(m => m.HomeComponent) },
  {
    path: 'admin',
    children: [
      { path: 'login', loadComponent: () => import('./admin/login/login.component').then(m => m.LoginComponent) },
      { path: 'dashboard', canActivate: [authGuard], loadComponent: () => import('./admin/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'menu', canActivate: [authGuard], loadComponent: () => import('./admin/menu-manager/menu-manager.component').then(m => m.MenuManagerComponent) },
      { path: 'gallery', canActivate: [authGuard], loadComponent: () => import('./admin/gallery-manager/gallery-manager.component').then(m => m.GalleryManagerComponent) },
      { path: 'hours', canActivate: [authGuard], loadComponent: () => import('./admin/hours-manager/hours-manager.component').then(m => m.HoursManagerComponent) },
      { path: 'config', canActivate: [authGuard], loadComponent: () => import('./admin/config-manager/config-manager.component').then(m => m.ConfigManagerComponent) },
      { path: 'reservations', canActivate: [authGuard], loadComponent: () => import('./admin/reservations/reservations.component').then(m => m.ReservationsComponent) },
      { path: 'reviews', canActivate: [authGuard], loadComponent: () => import('./admin/reviews/reviews.component').then(m => m.ReviewsComponent) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ]
  },
  { path: '**', redirectTo: '' }
];
