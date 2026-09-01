import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./feature/blog-overview-page/blog-overview-page').then((m) => m.BlogOverviewPage),
  },
  {
    path: 'blog/new',
    loadComponent: () =>
      import('./feature/blog-form-page/blog-form-page').then((m) => m.BlogFormPage),
  },
  {
    path: 'blog/:id/edit',
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
