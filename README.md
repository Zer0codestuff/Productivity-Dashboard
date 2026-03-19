# Gamified Stats Dashboard

Questa cartella contiene una versione deployabile del prototipo originale, mantenendo la UI del file `Gamified Stats Dashboard.tsx` come interfaccia principale.

## Obiettivo

- non cambiare il layout o lo stile del prototipo originale;
- rendere il progetto avviabile come app React/Vite;
- mantenere costi di deploy a zero usando hosting statico.

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

La UI principale viene renderizzata direttamente dal file originale `Gamified Stats Dashboard.tsx`, con un layer di compatibilita tecnica per poterla eseguire dentro il progetto senza riscriverne il design.
