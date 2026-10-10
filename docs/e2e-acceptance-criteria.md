# E2E-Akzeptanzkriterien (Arbeitsblatt A1, Kurstag 12)

Die Kriterien beschreiben, was ein Besucher sehen soll. Jedes Kriterium entspricht genau einem
Playwright-Test in `e2e/`.

## Aufgabe 4: Blog-Liste (`e2e/blog-overview.spec.ts`)

1. Wenn die Seite geladen wird, werden alle Blog-Einträge der API angezeigt, und der Zähler über
   der Liste nennt dieselbe Anzahl.
2. Jeder Blog-Eintrag zeigt Titel, Autor und einen Vorschautext.
3. Der Autoren-Filter reduziert die Liste auf die Blogs dieses Autors. "Alle Autoren" stellt die
   vollständige Liste wieder her.
4. Wenn die API einen Fehler liefert, erscheint eine Fehlermeldung statt einer leeren Liste.

### Verwendeter Prompt

```
Schreibe einen Playwright E2E-Test für diese Akzeptanzkriterien:
[Kriterien 1-4]
Die App läuft auf http://localhost:4200.
Nutze TypeScript und @playwright/test.
```

### Review

Der Test ist KI-generiert (Claude). Das Review hat sich auf die Stellen konzentriert, an denen
generierte Playwright-Tests typischerweise scheitern. Alle Selektoren wurden vor dem Commit gegen
das laufende DOM geprüft, nicht nur gegen den Quelltext.

| Typisches Risiko im generierten Test                   | Wie der Test im Repo es löst                                                                 |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| Erfundene Selektoren wie `.blog-list`, `[data-testid]` | Nur Selektoren, die es gibt: `app-blog-card`, `.blog-count`, `mat-card-title`                |
| Abhängigkeit vom echten Backend, Anzahl unbekannt      | API gestubbt mit `page.route()` (`e2e/fixtures/blog-api.ts`), Erwartungen sind damit fix     |
| `selectOption()` auf einem `mat-select`                | `mat-select` ist kein `<select>`: `getByRole('combobox')` öffnen, dann `getByRole('option')` |
| Feste Wartezeiten (`waitForTimeout`)                   | Web-First-Assertions (`toHaveCount`, `toHaveText`), die selbst warten                        |
| Nur der Happy Path                                     | Kriterium 4 deckt den Fehlerfall mit einem gestubbten 500er ab                               |

Am DOM verifiziert wurden: Zählerformat (`18 Blogs` bzw. `1 von 18 Blogs`), der Accessible Name
der Filter-Combobox (`Autor`), `role="option"` der Einträge, der Linktext `Details` samt
`/blog/:id`, Titel und `Zurueck`-Link der Detailseite, der Hinweis `Blog-Post nicht gefunden.`,
das `aria-label` des Hamburger-Buttons sowie `visibility: hidden` des geschlossenen Drawers
(darauf stützt sich `toBeVisible()`).

Das Stubbing hat einen zweiten Vorteil: Die Tests laufen gleich, egal ob lokal über das BFF oder in
der CI gegen das echte Backend.

## Aufgabe 5: Detailseite, Navigation, Guard

### Detailseite (`e2e/blog-detail.spec.ts`)

5. Ein Klick auf "Details" einer Karte öffnet die Detail-Route `/blog/:id` dieses Blogs.
6. Die Detailseite zeigt Titel und Autor und führt über "Zurueck" zur Übersicht.
7. Eine unbekannte id zeigt den Hinweis "Blog-Post nicht gefunden." statt einer leeren Karte.

### Navigation (`e2e/navigation.spec.ts`)

8. Auf Desktop (1280px) stehen "Blog" und "About" direkt in der Toolbar, es gibt keinen
   Hamburger-Button.
9. Auf Mobile (375px) sind die Links nicht in der Toolbar, sondern hinter dem Hamburger-Button.
10. Auf Mobile öffnet der Hamburger-Button den Drawer. Ein Klick auf "About" navigiert zur
    About-Seite und schliesst den Drawer.
11. Ohne Anmeldung ist das Blog-Erstellungsformular unter `/blog/create` nicht erreichbar.

Kriterium 11 prüft bewusst nur, dass das Formular nicht erscheint und die URL nicht
`/blog/create` bleibt. Das Redirect-Ziel unterscheidet sich je nach Umgebung: lokal ist Auth
aktiv und der Guard leitet auf `/login?returnUrl=...`, in der CI läuft der Production-Build mit
`authEnabled: false` und der Guard leitet auf `/`.

## Testergebnis

| Umgebung | Stand                                                                                                                                                                                                                                                                                   |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lokal    | **Nicht ausgeführt.** Auf dem Rechner ist kein Playwright-Browser installiert, und der Download wurde bewusst nicht gemacht. Geprüft wurden stattdessen: `npx playwright test --list` (12 Tests in 4 Dateien laden fehlerfrei) und alle verwendeten Selektoren direkt am laufenden DOM. |
| CI       | `npm run e2e` läuft in `.github/workflows/ci-build.yml` im Playwright-Container-Image, in dem die Browser vorinstalliert sind.                                                                                                                                                          |

Zum lokalen Ausführen:

```bash
npx playwright install chromium
npm run e2e
```

Playwright startet den Dev-Server selbst (`webServer` in `playwright.config.ts`).

## Konfiguration

- `screenshot: 'only-on-failure'` legt bei fehlgeschlagenen Tests automatisch einen Screenshot im
  HTML-Report ab (Bonus aus Aufgabe 5).
- Der lokale `webServer`-Befehl ist von `npm run start` auf `npm run start:fe` gewechselt. Die
  Tests stubben alle API-Antworten, brauchen das BFF also nicht. Der Functions-Host braucht rund
  eine Minute zum Start und lief damit in Playwrights 60-Sekunden-Timeout.

## Befund aus dem Testentwurf

Übersicht und Detailseite holen ihre Daten aus verschiedenen Quellen: Die Übersicht lädt über
`BlogService.getBlogs()` aus der API, die Detailseite nimmt `BlogService.getById()` und damit die
lokale Datei `src/app/data/blogs.json`. Beim Klick auf "Details" eines echten API-Blogs zeigt die
Detailseite deshalb einen anderen Beitrag oder gar nichts.

Kriterium 5 prüft darum nur die Route, Kriterium 6 ruft die Detailseite direkt mit einer id aus
der lokalen Datei auf. Ein Test, der den Titel der Karte mit dem Titel auf der Detailseite
vergleicht, würde den Bug aufdecken, aber die CI rot machen. Sinnvoller ist, die Detailseite in
einem eigenen PR auf dieselbe Datenquelle umzustellen und das Kriterium danach zu verschärfen.
