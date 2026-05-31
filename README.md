# Recomp Tracker

6-Wochen-Recomp Training-Tracker (Vanilla JS, buildless PWA-style Web-App).

## Struktur

```
recomp-tracker/
├── index.html        Markup + Einbindung von CSS/JS
├── css/
│   └── styles.css    Alle Styles
└── js/
    ├── storage.js    Storage-Layer (Claude-Storage / localStorage Fallback)
    ├── data.js       Trainingsplan: PLAN, TEMPLATES, Phasen-Logik
    ├── state.js      Globaler State S + Utils ($, num, toast, todayISO …)
    ├── charts.js     SVG-Charts: lineChart / barChart
    ├── render.js     Alle render*-Funktionen (Views, Listen, Verlauf)
    ├── app.js        app-Actions-Objekt (Button-/onclick-Handler)
    └── main.js       Navigation, Event-Wiring, init()
```

## Architektur-Hinweis

Bewusst **ohne Build-Schritt**. Die JS-Dateien sind klassische `<script>`-Includes
und teilen sich denselben globalen Scope. Die Reihenfolge in `index.html` ist
abhängigkeitsgerecht und muss erhalten bleiben:

`storage → data → state → charts → render → app → main`

`main.js` (init) läuft zuletzt und lädt die persistierten Daten.

Die inline `onclick="app.xxx(...)"`-Handler im generierten Markup greifen auf das
globale `window.app` zu (in `app.js` gesetzt). Bei einem späteren Umstieg auf
ES-Module müssten diese Handler auf `addEventListener` umgestellt werden.

## Lokal starten

Wegen der Font-Requests und `<script src>` am besten über einen lokalen Server,
nicht per `file://`:

```bash
python3 -m http.server 8000
# → http://localhost:8000
```
