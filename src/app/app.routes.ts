import { Routes } from '@angular/router';
import { authGuard } from './core/auth';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./feature/blog-overview-page/blog-overview-page').then((m) => m.BlogOverviewPage),
  },
  {
    path: 'login',
    loadComponent: () => import('./feature/login-page/login-page').then((m) => m.LoginPage),
  },
  {
    path: 'blog/create',
    loadComponent: () =>
      import('./feature/blog-create/blog-create').then((m) => m.BlogCreateComponent),
  },
  {
    path: 'blog/new',
    canMatch: [authGuard],
    data: { roles: ['user'] },
    loadComponent: () =>
      import('./feature/blog-form-page/blog-form-page').then((m) => m.BlogFormPage),
  },
  {
    path: 'blog/:id/edit',
    canMatch: [authGuard],
    data: { roles: ['user'] },
    loadComponent: () =>
      import('./feature/blog-form-page/blog-form-page').then((m) => m.BlogFormPage),
  },
  {
    path: 'blog/:id',
    loadComponent: () =>
      import('./feature/blog-detail-page/blog-detail-page').then((m) => m.BlogDetailPage),
  },
  {
    path: 'about',
    loadComponent: () => import('./feature/about-page/about-page').then((m) => m.AboutPage),
  },
];
