import { DestroyRef, Signal, inject, signal } from '@angular/core';

export const MOBILE_MEDIA_QUERY = '(max-width: 767.98px)';

export function mediaQuerySignal(query: string): Signal<boolean> {
  const destroyRef = inject(DestroyRef);
  const mediaQueryList = window.matchMedia(query);
  const matches = signal(mediaQueryList.matches);

  const onChange = (event: MediaQueryListEvent) => matches.set(event.matches);

  mediaQueryList.addEventListener('change', onChange);
  destroyRef.onDestroy(() => mediaQueryList.removeEventListener('change', onChange));

  return matches.asReadonly();
}
