# BrainBoostWEB

BrainBoostWEB ist eine responsive Lern-App für Schülerinnen und Schüler. Die App kombiniert einen langen, gamifizierten Lernpfad, einen kontraststarken Video-Bereich, Lernplanung, Terminverwaltung, Bewerbungstracking und smarte Lern-Tools.

## Funktionen

- **Duolingo-inspirierter Lernpfad** als wellenförmige Roadmap mit umschaltbaren Fächern Mathe, Deutsch und Englisch.
- **Echte Übungen, Abfragen und Prüfungen**: Nach fünf Übungen kommt eine Abfrage, danach weitere Übungen und eine Abschlussprüfung pro Fach.
- **Video-Bereich** mit dunklen, gut lesbaren Videokarten für schnelle Wiederholung.
- **Lernplaner, Termine und Bewerbungen** ohne Beispiel-Datensätze: Nutzerinnen und Nutzer tragen echte Daten ein, die im Browser gespeichert werden.
- **Lokaler Browser-Speicher** mit Statusanzeige und leeren Startzuständen statt Fake-Inhalten.
- **Tools-Seite** für Lernpakete, Mini-Quiz und Gliederungen.
- **Spiele-Reiter** mit Monster-Hunter-Menü nach ferristhiel/Game, Monster-Arena, XP-Minispielen und XP-Shop zum Ausgeben gesammelter Punkte.
- **Flammen-Streak-System** als eine saubere Flamme mit Zahl in der Navigation und im Spiele-Wallet.
- **Profilseite** mit aktuellem/längstem Streak, Freunden, Inventar, Profil bearbeiten und Logout-Menü.
- **Intro/Ladebalken und GitHub-CTA** für einen klareren Einstieg und schnellen Sprung zur Projektseite.
- **Production-ready Express-Server** mit Healthcheck, Security-Headern, statischen Assets und robustem API-Fallback.

## Entwicklung

```bash
npm install
npm start
```

Danach ist die App unter <http://localhost:3000> erreichbar.

## Checks

```bash
npm run check
```

## KI-Konfiguration

Die Tools funktionieren ohne API-Key mit lokalen Vorlagen. Für KI-Antworten kann optional eine `.env` Datei angelegt werden:

```bash
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
PORT=3000
```

## Deployment-Hinweise

- Node.js 18 oder neuer verwenden.
- `NODE_ENV=production` setzen, damit statische Assets gecacht werden.
- `/health` als Healthcheck-Endpunkt nutzen.
- Browserdaten werden bewusst lokal im jeweiligen Browser gespeichert; für Multi-Geräte-Sync wäre später ein Backend-Account nötig.
