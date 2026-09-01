import { Component, computed, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { environment } from '../../../environments/environment';

const ERROR_MESSAGES: Record<string, string> = {
  access_denied: 'Der Zugriff wurde verweigert. Dein Konto hat nicht die noetige Berechtigung.',
  expired: 'Die Anmeldung ist abgelaufen. Bitte melde dich erneut an.',
  failed: 'Die Anmeldung ist fehlgeschlagen. Bitte versuche es noch einmal.',
};

@Component({
  selector: 'app-login-page',
  imports: [MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
})
export class LoginPage {
  readonly returnUrl = input('/');
  readonly error = input<string | undefined>(undefined);

  protected readonly errorMessage = computed(() => {
    const code = this.error();

    if (!code) {
      return null;
    }

    return ERROR_MESSAGES[code] ?? 'Bei der Anmeldung ist ein unbekannter Fehler aufgetreten.';
  });

  protected login(): void {
    const returnUrl = encodeURIComponent(this.returnUrl());

    window.location.href = `${environment.bffUrl}/auth/login?returnUrl=${returnUrl}`;
  }
}
