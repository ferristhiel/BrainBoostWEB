# BrainBoostWEB

BrainBoostWEB ist eine responsive Lern-App für Schülerinnen und Schüler. Die App kombiniert einen langen, gamifizierten Lernpfad, einen Video-Bereich, Lernplanung, Terminverwaltung, Bewerbungstracking und smarte Lern-Tools.

## Funktionen

- **Duolingo-inspirierter Lernpfad** mit XP, Leveln, Streaks, Boss-Leveln und Fortschrittsbalken.
- **Video-Bereich** mit kompakten Lernkarten für schnelle Wiederholung.
- **Lernplaner, Termine und Bewerbungen** mit lokaler Speicherung im Browser.
- **Tools-Seite** für Lernpakete, Mini-Quiz und Gliederungen.
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
