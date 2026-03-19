# Project Overview

Questo progetto e una dashboard React single-page costruita con Vite e TypeScript. Lo scopo di questo file e dare a un'altra AI una mappa rapida del codice senza dover rileggere tutto da zero.

## Stack

- React 19
- TypeScript
- Vite
- Recharts per i grafici
- Lucide React per le icone
- CSS variables globali in `src/styles.css`
- Tailwind via CDN configurato in `index.html`

## Entry Points

- [src/main.tsx](/C:/Users/monny/Documents/New%20project/src/main.tsx)
  Monta `App` e importa gli stili globali.

- [src/App.tsx](/C:/Users/monny/Documents/New%20project/src/App.tsx)
  Renderizza il componente principale `GamifiedStatsDashboard`.

- [src/GamifiedStatsDashboard.tsx](/C:/Users/monny/Documents/New%20project/src/GamifiedStatsDashboard.tsx)
  E il vero cuore dell'app attuale. Quasi tutta la UI usata davvero vive qui.

## File Legacy / Secondari

Questi file esistono ma al momento non sono il ramo UI principale montato da `App.tsx`:

- [src/features/dashboard/DashboardSection.tsx](/C:/Users/monny/Documents/New%20project/src/features/dashboard/DashboardSection.tsx)
- [src/features/profile/ProfileSection.tsx](/C:/Users/monny/Documents/New%20project/src/features/profile/ProfileSection.tsx)
- [src/features/tasks/TasksSection.tsx](/C:/Users/monny/Documents/New%20project/src/features/tasks/TasksSection.tsx)
- [src/features/habits/HabitsSection.tsx](/C:/Users/monny/Documents/New%20project/src/features/habits/HabitsSection.tsx)
- [src/features/journal/JournalSection.tsx](/C:/Users/monny/Documents/New%20project/src/features/journal/JournalSection.tsx)
- [src/hooks/useLocalState.ts](/C:/Users/monny/Documents/New%20project/src/hooks/useLocalState.ts)
- [src/lib/storage.ts](/C:/Users/monny/Documents/New%20project/src/lib/storage.ts)

Questi possono essere riutilizzati in futuro, ma oggi la UI realmente mostrata e concentrata nel file `src/GamifiedStatsDashboard.tsx`.

## UI Library Compat

- [src/ui-compat.tsx](/C:/Users/monny/Documents/New%20project/src/ui-compat.tsx)

Fornisce componenti leggeri tipo `Button`, `Card`, `Input`, `Textarea`, `Badge`, `Tooltip` ecc. Non e una libreria completa: molti componenti sono wrapper minimi. Se un componente sembra “shadcn-like”, probabilmente qui e solo una compat layer semplificata.

## Tema e Modalita Light/Dark

- [src/styles.css](/C:/Users/monny/Documents/New%20project/src/styles.css)

Qui vivono i token globali:

- `:root` = tema dark
- `:root[data-theme="light"]` = tema light

La modalita viene controllata da:

- stato `themeMode` in `GamifiedStatsDashboard`
- `useEffect` che fa `document.documentElement.dataset.theme = themeMode`

L'accent color viene controllato da:

- stato `primaryColorKey`
- mappa `colorThemes`
- `useEffect` che aggiorna `--primary` e `--primary-foreground`

Regola importante:

- evitare hardcode come `bg-black`, `text-white`, `#000000`, `#ffffff` se il pezzo deve funzionare anche in light mode
- preferire `background`, `foreground`, `muted`, `popover`, `border`

## Stato Principale in GamifiedStatsDashboard

Stati importanti presenti nel componente:

- `profileName`
- `avatarSrc`
- `activePage`
  Valori attuali: `"dashboard"` o `"settings"`
- `themeMode`
  Valori attuali: `"dark"` o `"light"`
- `primaryColorKey`
  Accent theme corrente
- `level`, `xp`, `xpToNext`, `xpInput`, `levelUpFlash`
- `radarStats`
  Array di oggetti `{ id, area, value }`
- `energy`
  Array di metriche giornaliere `{ key, icon, value }`
- `energyHistory`
  Storico ultimi giorni, usato dal grafico energia
- `motivation`
  Frase mostrata nella card stagionale
- `isEditingArc`
- `habits`
- `newHabitName`

## Pagine Principali

### Dashboard

La pagina principale e organizzata in 3 colonne responsive:

- colonna sinistra
  Profile card, Daily Energy, Theme Accent, Manage Stats

- colonna centrale
  Radar chart, card stagionale (`Spring Arc`, `Summer Arc` ecc), Daily Energy Chart

- colonna destra
  XP, habit tracker, banner, stats table

### Settings

Pagina introdotta per configurazioni rapide:

- cambio nome
- cambio foto profilo
- scelta dark/light
- accent color
- export data
- import data
- summary rapido

La navigazione tra `Dashboard` e `Settings` e fatta con lo stato `activePage`.

## Controlli Numerici Mobile-Friendly

Esiste un componente helper dentro `GamifiedStatsDashboard.tsx`:

- `StepperControl`

Serve per aumentare/diminuire i valori con pulsanti grandi `- / +`, utili su mobile.

Attualmente viene usato in:

- `Daily Energy`
- `Manage Stats`
- `Gain XP`

Se devi aggiungere altri controlli numerici, riusa questo pattern invece di aggiungere piccoli input difficili da toccare.

## Grafici

### Radar Chart

Usa `recharts`:

- `RadarChart`
- `PolarGrid`
- `PolarAngleAxis`
- `PolarRadiusAxis`
- `Radar`

Note importanti:

- ha altezza esplicita, non solo `min-height`
- usa `outerRadius="72%"`
- il contrasto cambia in base a `isLightMode`
- i valori provengono da `radarStats`

Se il radar “non funziona”, prima controllare:

- altezza contenitore
- struttura `radarStats`
- contrasto light/dark

### Daily Energy Chart

Usa `LineChart` con storico multigiorno.

Regola estetica attuale:

- tutte le linee usano il colore del tema
- `Willpower` e la linea principale
- `Health` usa opacita media
- `Mood` usa opacita piu bassa e tratteggio

I dati vengono generati e sincronizzati tramite:

- `buildInitialEnergyHistory`
- `syncTodayHistory`

## Arc Stagionale

La card “arc” usa:

- `getSeasonArcLabel`
- `getSeasonArcIcon`

Mappa attuale:

- primavera: `Spring Arc` + `Flower2`
- estate: `Summer Arc` + `SunMedium`
- autunno: `Autumn Arc` + `Leaf`
- inverno: `Winter Arc` + `Snowflake`

La frase editabile e `motivation`.
Il titolo stagionale e solo una label piccola; la frase principale e il contenuto visivamente dominante.

## Export / Import

Gestiti direttamente in `GamifiedStatsDashboard.tsx`.

### Export

Funzione:

- `exportData`

Esporta JSON con:

- profilo
- tema
- XP
- radar stats
- energy
- energyHistory
- motivation
- habits

### Import

Funzione:

- `importData`

Fa merge selettivo di alcuni campi validi. Se il file e invalido, viene ignorato silenziosamente.

## Convenzioni Utili per Modifiche Future

- Per modifiche vere alla UI principale, partire quasi sempre da `src/GamifiedStatsDashboard.tsx`
- Per problemi di contrasto, controllare prima `src/styles.css` e poi cercare hardcode colore nel componente
- Per nuovi pulsanti o card, usare i componenti di `src/ui-compat.tsx`
- Per cambiare nome app in header, modificare `profileName` o il titolo in `GamifiedStatsDashboard`
- Per ampliare il layout desktop, guardare `max-w-[1680px]` e le larghezze delle 3 colonne

## Known Caveats

- L'app non e ancora divisa in componenti piccoli: il file `src/GamifiedStatsDashboard.tsx` e grande e monolitico
- Esistono file `features/*` non usati dalla UI attuale
- La build TypeScript (`tsc -b`) e il check minimo piu affidabile in questo ambiente
- `vite build` puo fallire nel sandbox desktop per limiti di esecuzione, anche se il codice TypeScript e corretto

## Comando di Verifica Utile

- `node_modules\\.bin\\tsc.cmd -b`

Questo e il controllo veloce consigliato dopo modifiche al progetto.
