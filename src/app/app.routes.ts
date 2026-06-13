import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./feature/blog/blog-page').then((m) => m.BlogOverview),
  },
];
