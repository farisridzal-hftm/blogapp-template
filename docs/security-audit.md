# Security-Audit (Arbeitsblatt A1, Kurstag 11)

Stand: 22.09.2026, Branch `feature/responsive-security`. Geprüft wurden das Angular-Frontend (`src/`)
und das BFF (`bff/src/`).

## Aufgabe 4: Checkliste

| Check                  | Ergebnis                                                    |
| ---------------------- | ----------------------------------------------------------- |
| `[innerHTML]`          | Keine Treffer (auch kein `outerHTML`, `insertAdjacentHTML`) |
| `bypassSecurityTrust*` | Keine Treffer, `DomSanitizer` wird nirgends verwendet       |
| Interpolation `{{ }}`  | Sicher, alle User-Inhalte laufen über Interpolation         |
| Redirects / URLs       | **Open Redirect im BFF gefunden und behoben** (siehe unten) |

Suche:

```bash
grep -rn "innerHTML\|outerHTML\|insertAdjacentHTML" src bff/src
grep -rn "bypassSecurity\|DomSanitizer" src bff/src
grep -rn "redirect\|returnUrl\|location.href\|navigateByUrl" src bff/src --include=*.ts
```

### Interpolation

Titel, Autor und Inhalt eines Blogs werden in `blog-card.html` und `blog-detail-page.html` nur über
`{{ }}` ausgegeben, Angular escaped sie also. Das Header-Bild kommt vom User (`headerImageUrl`) und
wird per Property-Binding `[src]` gesetzt. Dort greift Angulars URL-Sanitizer, eine
`javascript:`-URL wird zu `unsafe:javascript:` und damit wirkungslos.

### Open Redirect über `returnUrl`

Die Login-Seite übergibt `?returnUrl=` an `GET /api/auth/login`. Das BFF merkt sich den Wert und
leitet nach dem Login per `Location`-Header dorthin weiter. `safeReturnUrl()` hat bisher nur geprüft,
ob der Wert mit `/` beginnt und nicht mit `//` oder `/\`.

Der WHATWG-URL-Parser im Browser entfernt aber Tabs und Zeilenumbrüche, bevor er eine URL auflöst.
Dadurch kam folgender Wert durch die Prüfung:

```
/login?returnUrl=%2F%09%2Fevil.example
```

`/\t/evil.example` beginnt mit `/`, aber nicht mit `//`, und wurde deshalb akzeptiert. Der Browser
macht daraus `//evil.example`, also eine protocol-relative URL auf eine fremde Domain. Ein Angreifer
hätte einen echten Login-Link verschicken können, der nach erfolgreicher Anmeldung auf seine
Phishing-Seite führt.

**Fix** (`bff/src/lib/keycloak.ts`): Die URL wird jetzt mit demselben Parser wie im Browser gegen
eine feste Basis aufgelöst. Nur wenn der Origin gleich bleibt, gibt die Funktion den normalisierten
Pfad samt Query und Fragment zurück, sonst `/`. Tab, Newline und Backslash-Varianten decken neue
Testfälle in `keycloak.spec.ts` ab.

### Weitere Beobachtungen

- Die Buttons für Bearbeiten und Löschen auf den Blog-Karten sehen alle Besucher. Das ist kein
  Sicherheitsproblem, weil das Backend ohne gültiges Token mit 401 antwortet. Für die UX könnte
  man sie über `createdByMe` ausblenden.
- Der `error`-Query-Parameter der Login-Seite wird nicht direkt angezeigt. Er dient nur als
  Schlüssel für eine feste Tabelle von Meldungen.

## Aufgabe 5: Auth Guards

| Route            | Guard                       | Soll       | Status      |
| ---------------- | --------------------------- | ---------- | ----------- |
| `/`              | keiner                      | öffentlich | ok          |
| `/blog/:id`      | keiner                      | öffentlich | ok          |
| `/about`         | keiner                      | öffentlich | ok          |
| `/login`         | keiner                      | öffentlich | ok          |
| `/blog/new`      | `canMatch: authGuard`, user | geschützt  | ok          |
| `/blog/:id/edit` | `canMatch: authGuard`, user | geschützt  | ok          |
| `/blog/create`   | fehlte                      | geschützt  | **ergänzt** |

Admin-Routen gibt es in der App keine. Die Signal-Forms-Route `/blog/create` aus dem letzten
Arbeitsblatt hatte keinen Guard und hat jetzt denselben wie `/blog/new`.

Der `authGuard` leitet nicht angemeldete User auf `/login?returnUrl=<ursprüngliche Route>` weiter.
Fehlt eine Rolle, geht es auf `/login?error=access_denied`. In Production ist Auth deaktiviert
(`authEnabled: false`), dort leitet der Guard auf `/` um.

Der Guard ist nur UX. Die eigentliche Absicherung passiert im Backend, das jeden schreibenden
Request ohne gültiges Token ablehnt.

## Aufgabe 7: Content Security Policy

```
Content-Security-Policy:
  default-src 'none';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  font-src 'self';
  img-src 'self' data: https:;
  connect-src 'self' https://d-cap-blog-backend---v2.whitepond-b96fee4b.westeurope.azurecontainerapps.io;
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none'
```

| Direktive         | Warum                                                                              |
| ----------------- | ---------------------------------------------------------------------------------- |
| `default-src`     | `'none'`: alles, was nicht ausdrücklich erlaubt ist, wird blockiert                |
| `script-src`      | Nur die eigenen Bundles. Keine Inline-Scripts, kein `eval`                         |
| `style-src`       | `'unsafe-inline'` ist nötig, weil Angular Komponenten-Styles als `<style>` einfügt |
| `font-src`        | Roboto und Material Icons werden selbst gehostet (siehe unten)                     |
| `img-src`         | `data:` für Base64-Bilder aus dem Backend, `https:` für User-Header-Bilder         |
| `connect-src`     | API-Calls: in Dev über das BFF (`'self'`), in Production direkt ans Backend        |
| `base-uri`        | Verhindert, dass ein injiziertes `<base>` alle relativen URLs umbiegt              |
| `form-action`     | Formulare dürfen nur an die eigene Origin senden                                   |
| `frame-ancestors` | Clickjacking-Schutz. Wirkt nur als HTTP-Header, nicht im Meta-Tag                  |

`img-src https:` ist bewusst weiter gefasst, weil User beliebige Bild-URLs als Header-Bild
eintragen können. Bilder können keinen Code ausführen. Der Preis ist, dass fremde Server die IP
der Besucher sehen.

### Wo die Policy konfiguriert ist

- **Dev-Server:** echter HTTP-Header über `serve.options.headers` in `angular.json`. Hier ist
  `connect-src` nur `'self'`, weil alle API-Calls über den Proxy laufen.
- **Production:** `<meta http-equiv="Content-Security-Policy">` in `src/index.html`. Die App liegt
  auf einer Azure Storage Static Website, und die kann keine eigenen Response-Header senden. Für
  einen echten Header inkl. `frame-ancestors` bräuchte es Azure Front Door (Rules Engine) oder
  einen Wechsel auf Azure Static Web Apps (`staticwebapp.config.json` → `globalHeaders`).

Die Policy steht damit an zwei Stellen und muss bei Änderungen an beiden angepasst werden.

### Google Fonts entfernt

`index.html` hat Roboto und Material Icons bisher von `fonts.googleapis.com` geladen. Mit
`'self'` wären beide blockiert worden, und alle Icons wären als Text erschienen. Die Fonts kommen
jetzt aus npm-Paketen (`@fontsource/roboto`, `material-icons`) und werden mitgebaut. Nebeneffekt:
Beim Seitenaufruf geht keine Anfrage mehr an Google, was auch datenschutzrechtlich besser ist.

### Verifikation

Im Browser geprüft (Dev-Server und Production-Build):

- keine CSP-Verstösse beim normalen Betrieb, Blogs laden (Dev über BFF, Prod direkt vom Backend)
- Gegenprobe per Konsole: ein externes Script, ein Inline-Script und ein `http:`-Bild werden
  blockiert (`script-src-elem`, `img-src`), das Inline-Script läuft nicht

## Experte: `npm audit`

### Frontend (`/`)

29 Findings: 1 critical, 18 high, 6 moderate, 4 low. Mit `npm audit --omit=dev` bleiben **3 high**
übrig, alle in Paketen, die im Browser-Bundle landen:

| Paket               | Version | Advisories (Auswahl)                                                  | Betroffen?                              |
| ------------------- | ------- | --------------------------------------------------------------------- | --------------------------------------- |
| `@angular/core`     | 22.0.0  | Hydration DOM Clobbering, i18n-XSS, Sanitization-Bypass Host-Bindings | kein SSR, kein i18n                     |
| `@angular/common`   | 22.0.0  | `HttpTransferCache` Cache Poisoning, `formatDate` DoS                 | kein SSR, kein `DatePipe`               |
| `@angular/compiler` | 22.0.0  | Two-Way-Binding Sanitization-Bypass, i18n-XSS                         | keine Two-Way-Bindings auf `src`/`href` |

Die App nutzt die betroffenen Features nicht, das Risiko ist also gering. Trotzdem sollte Angular
auf **22.1.7** gehoben werden, weil die Lücken genau die XSS-Schutzmechanismen betreffen, auf die
sich Aufgabe 4 verlässt.

Die restlichen 26 Findings betreffen nur Build- und Test-Tooling (`tar` über `@angular/cli` →
`pacote`, `vite`, `undici` über `jsdom`, `postcss`, `esbuild` usw.). Sie laufen nur lokal oder in
CI, nie beim User. Für alle gibt es einen Fix über `npm audit fix` ohne `--force`.

### BFF (`/bff`)

2 high in `extract-zip`, das nur `azure-functions-core-tools` (devDependency) nutzt.
`npm audit --omit=dev` meldet 0 Schwachstellen. Der vorgeschlagene Fix (`--force`) würde auf
Core Tools v3 downgraden und ist deshalb keine Option.

### Empfehlung

Angular-Update und `npm audit fix` in einem eigenen PR, damit Framework-Änderungen nicht mit den
Features dieses Arbeitsblatts vermischt werden.
