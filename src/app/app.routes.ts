import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./feature/blog/blog').then((m) => m.BlogOverview),
  },
];
