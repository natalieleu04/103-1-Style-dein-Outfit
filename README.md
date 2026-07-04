# MANGO Outfit Builder

Ein Web-Prototyp, mit dem Nutzer Kleidungsstücke einer Marke (Oberteile, Unterteile,
Kleider, Jacken) zu einem Outfit kombinieren, auf einer Figur visualisieren und
speichern können.

## Funktionen

- Auswahl von Kleidungsstücken nach Kategorien und Unterkategorien
- Visuelle Darstellung des Outfits auf einer Damen- bzw. Herrenfigur (mit Schuhen)
- Seitliche Beschriftung der getragenen Teile mit Verbindungslinien
- Speichern eigener Looks (mit Umbenennen, Laden, Löschen) über eine eigene Unterseite
- Passform-Editor zum individuellen Justieren jedes Kleidungsstücks
- Verlinkung jedes Produkts zum Online-Shop

## Technologien

- **HTML** (`index.html`) – Struktur und Inhalt der Seite
- **CSS** (`style.css`) – Gestaltung und Layout
- **JavaScript** (`script.js`) – Logik und Interaktivität
- **JSON** (`products.json`) – Produktdaten (Name, Preis, Kategorie, Farbe, Bildpfade,
  Shop-Link und Passform-Werte)

## Projektstruktur

```
.
├── index.html          # HTML-Grundgerüst, bindet CSS und JS ein
├── style.css           # gesamtes Styling
├── script.js           # gesamte Anwendungslogik
├── products.json       # Produktdaten (werden per fetch geladen)
└── assets/
    ├── web/            # Produktbilder für die Auswahlkarten
    ├── fig/            # freigestellte Produktbilder für die Figur
    └── figures/        # Figuren (Damen/Herren) und Schuhe
```

## Starten

Weil die Produktdaten per `fetch` aus `products.json` geladen werden, muss das Projekt
über einen (lokalen) Webserver laufen – ein einfacher Doppelklick auf `index.html`
funktioniert wegen der Browser-Sicherheitsregeln für lokale Dateien nicht.

Einfachste Möglichkeit mit Python:

```bash
python3 -m http.server 8000
```

Danach im Browser öffnen: `http://localhost:8000`

Alternativ: In VS Code die Erweiterung **Live Server** verwenden und `index.html`
mit „Open with Live Server" starten.

## Hinweise

- Gespeicherte Looks werden lokal im Browser (localStorage) abgelegt und bleiben
  nur auf dem jeweiligen Gerät/Browser erhalten.
- Die Produktbilder sind freigestellt (transparenter Hintergrund).
- Die verwendeten Produkte und Preise sind fiktiv und dienen nur zu Demozwecken.
