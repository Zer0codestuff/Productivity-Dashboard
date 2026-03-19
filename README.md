# Productivity-Dashboard

Una dashboard gamificata per monitorare progressi, abitudini, energia giornaliera e journal personale in un’unica interfaccia React.

## Cosa Fa

Il progetto mette insieme in modo visivo alcuni blocchi chiave di produttivita:

- profilo con nome e immagine personalizzabili
- statistiche del personaggio con radar chart
- energia giornaliera con storico recente
- habit tracker con streak e XP
- journal giornaliero con calendario e storico
- pagina `Settings` per cambiare tema, accent, profilo ed esportare i dati

L’idea e tenere la UI compatta ma “game-like”, con un look coerente sia in dark mode sia in light mode.

## Struttura

La parte davvero usata dall’app oggi e concentrata qui:

- `src/GamifiedStatsDashboard.tsx`

Il resto del progetto fornisce supporto tecnico e documentazione:

- `src/App.tsx` monta il dashboard principale
- `src/main.tsx` avvia React
- `src/styles.css` definisce tema, colori globali e dark/light mode
- `src/ui-compat.tsx` contiene i componenti UI di base usati nel layout
- `project.md` spiega il progetto in modo più dettagliato per una AI o per una revisione rapida

## Funzionalità Principali

### Dashboard

La pagina principale è divisa in tre colonne responsive:

- sinistra: profilo, energia giornaliera, accent, modifica statistiche
- centro: radar chart, frase stagionale, daily energy chart
- destra: XP, habits, banner, tabella delle stats

### Settings

La pagina delle impostazioni serve per i cambiamenti più importanti:

- cambio nome profilo
- cambio foto profilo
- tema chiaro o scuro
- accent color
- export dei dati
- import dei dati

### Journal

Il journal giornaliero permette di:

- scrivere la pagina del giorno
- rivedere i giorni precedenti
- usare un calendario per aprire un entry specifico
- guadagnare XP quando si scrive
- ricevere bonus aggiuntivi sulle streak

## Dati e Persistenza

Il dashboard salva automaticamente lo stato in `localStorage`, quindi non dipende solo dall’export/import manuale.

Tra i dati salvati ci sono:

- profilo
- tema
- accent
- XP e livello
- radar stats
- energia giornaliera
- storico energia
- habits
- journal entries
- date già ricompensate per il journal

L’export crea comunque un JSON completo, utile per backup o migrazione.

## Tecnologie

- React
- TypeScript
- Vite
- Recharts
- Lucide React
- CSS variables globali

## Avvio Locale

```bash
npm install
npm run dev
```

## Build Produzione

```bash
npm run build
```

La cartella `dist/` risultante puo essere deployata come sito statico.

## Deploy

### Vercel

1. importa il repository
2. framework preset: `Vite`
3. build command: `npm run build`
4. output directory: `dist`

### Netlify

1. importa il repository
2. build command: `npm run build`
3. publish directory: `dist`

## Dove Mettere Le Mani

Se vuoi modificare il progetto, di solito i punti giusti sono questi:

- logica principale e UI: `src/GamifiedStatsDashboard.tsx`
- colori globali e modalità light/dark: `src/styles.css`
- componenti UI di base: `src/ui-compat.tsx`
- mappa generale del progetto: `project.md`

## Nota

La UI principale viene renderizzata direttamente dal file `src/GamifiedStatsDashboard.tsx`, con un layer di compatibilita tecnica per poterla eseguire dentro il progetto senza riscriverne il design originale.
