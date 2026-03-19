# Productivity-Dashboard

Gamified Dashboard to maximize productivity.

## Obiettivo

- mantenere il layout e lo stile del prototipo originale;
- rendere il progetto avviabile come app React/Vite;
- permettere un deploy statico semplice e gratuito.

## Avvio locale

```bash
npm install
npm run dev
```

## Build produzione

```bash
npm run build
```

La cartella `dist/` risultante puo essere deployata come sito statico.

## Deploy gratuito

### Vercel

1. importa il repository;
2. framework preset: `Vite`;
3. build command: `npm run build`;
4. output directory: `dist`.

### Netlify

1. importa il repository;
2. build command: `npm run build`;
3. publish directory: `dist`.

## Nota

La UI principale viene renderizzata direttamente dal file `src/GamifiedStatsDashboard.tsx`, con un layer di compatibilita tecnica per poterla eseguire dentro il progetto senza riscriverne il design.
