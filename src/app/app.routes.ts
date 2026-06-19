import { Routes } from '@angular/router';

import { blogDetailResolver } from './feature/blog-detail/blog-detail.resolver';
import { BlogOverview } from './feature/blog-overview/blog-overview';

export const routes: Routes = [
  {
    path: '',
    component: BlogOverview,
  },
  {
    path: 'blog/:id',
    loadComponent: () => import('./feature/blog-detail/blog-detail').then((m) => m.BlogDetail),
    resolve: {
      blog: blogDetailResolver,
    },
  },
  {
    path: '**',
    loadComponent: () => import('./feature/not-found/not-found').then((m) => m.NotFound),
  },
];
