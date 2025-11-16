import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
  {
    path: 'auth/login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'courses',
    loadComponent: () =>
      import('./features/courses/courses-list/courses-list.component').then(
        (m) => m.CoursesListComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'search',
    loadComponent: () =>
      import('./features/search/advanced-search/advanced-search.component').then(
        (m) => m.AdvancedSearchComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'checkout/:courseId',
    loadComponent: () =>
      import('./features/payment/checkout/checkout.component').then(
        (m) => m.CheckoutComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'notifications',
    loadComponent: () =>
      import('./features/notifications/notifications-page/notifications-page.component').then(
        (m) => m.NotificationsPageComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: '**',
    redirectTo: '/dashboard',
  },
];
