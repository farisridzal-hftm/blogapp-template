import { computed, DOCUMENT, inject, Injectable, signal } from '@angular/core';

export type ThemeMode = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'theme-mode';
const MODES: ThemeMode[] = ['system', 'light', 'dark'];

const ICONS: Record<ThemeMode, string> = {
  system: 'brightness_auto',
  light: 'light_mode',
  dark: 'dark_mode',
};

const LABELS: Record<ThemeMode, string> = {
  system: 'System',
  light: 'Hell',
  dark: 'Dunkel',
};

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly document = inject(DOCUMENT);

  readonly mode = signal<ThemeMode>(this.readStoredMode());

  readonly icon = computed(() => ICONS[this.mode()]);

  readonly label = computed(() => LABELS[this.mode()]);

  constructor() {
    this.applyMode(this.mode());
  }

  cycle(): void {
    const next = MODES[(MODES.indexOf(this.mode()) + 1) % MODES.length];
    this.mode.set(next);
    localStorage.setItem(STORAGE_KEY, next);
    this.applyMode(next);
  }

  private applyMode(mode: ThemeMode): void {
    const root = this.document.documentElement;
    root.classList.toggle('light-theme', mode === 'light');
    root.classList.toggle('dark-theme', mode === 'dark');
  }

  private readStoredMode(): ThemeMode {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    return stored && MODES.includes(stored) ? stored : 'system';
  }
}
