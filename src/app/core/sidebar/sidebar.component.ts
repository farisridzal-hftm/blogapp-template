import { Component, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthStore } from '../auth';
import { ThemeService } from '../theme.service';
import { MOBILE_MEDIA_QUERY, mediaQuerySignal } from '../utils';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  imports: [
    NgTemplateOutlet,
    RouterLink,
    RouterLinkActive,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatToolbarModule,
    MatTooltipModule,
  ],
})
export class SidebarComponent {
  protected readonly title = 'HFTM Web Applications (IN353)';

  protected readonly theme = inject(ThemeService);
  protected readonly auth = inject(AuthStore);

  protected readonly isMobile = mediaQuerySignal(MOBILE_MEDIA_QUERY);
  protected readonly menuOpen = signal(false);

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }
}
