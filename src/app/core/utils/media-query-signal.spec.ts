import {
  EnvironmentInjector,
  createEnvironmentInjector,
  runInInjectionContext,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { mediaQuerySignal } from './media-query-signal';

describe('mediaQuerySignal', () => {
  let listeners: Set<(event: MediaQueryListEvent) => void>;
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(() => {
    listeners = new Set();
    originalMatchMedia = window.matchMedia;

    window.matchMedia = (query: string) =>
      ({
        matches: true,
        media: query,
        addEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) =>
          listeners.add(listener),
        removeEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) =>
          listeners.delete(listener),
      }) as unknown as MediaQueryList;
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  function createInjector(): EnvironmentInjector {
    return createEnvironmentInjector([], TestBed.inject(EnvironmentInjector));
  }

  it('starts with the current match state and follows change events', () => {
    const injector = createInjector();
    const isMobile = runInInjectionContext(injector, () =>
      mediaQuerySignal('(max-width: 767.98px)'),
    );

    expect(isMobile()).toBe(true);

    listeners.forEach((listener) => listener({ matches: false } as MediaQueryListEvent));

    expect(isMobile()).toBe(false);
  });

  it('removes its listener when the injection context is destroyed', () => {
    const injector = createInjector();
    runInInjectionContext(injector, () => mediaQuerySignal('(max-width: 767.98px)'));

    expect(listeners.size).toBe(1);

    injector.destroy();

    expect(listeners.size).toBe(0);
  });
});
