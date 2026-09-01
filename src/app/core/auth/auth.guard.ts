import { inject } from '@angular/core';
import { CanMatchFn, Route, Router, UrlSegment } from '@angular/router';
import { AuthStore } from './auth.store';

export const authGuard: CanMatchFn = async (route: Route, segments: UrlSegment[]) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  await authStore.ready;

  const returnUrl = `/${segments.map((segment) => segment.path).join('/')}`;

  if (!authStore.isAuthenticated()) {
    return router.createUrlTree(['/login'], { queryParams: { returnUrl } });
  }

  const requiredRoles = (route.data?.['roles'] as string[] | undefined) ?? [];
  const hasAccess = requiredRoles.every((role) => authStore.hasRole(role));

  if (!hasAccess) {
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl, error: 'access_denied' },
    });
  }

  return true;
};
