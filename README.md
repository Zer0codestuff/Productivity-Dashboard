# Momentum Journal

A gamified personal dashboard for habits, energy tracking, XP progression, and journaling.

![Site screenshot](./Screenshot%202026-03-19%20at%2017-13-00%20Momentum%20Journal.png)

## What it includes

- profile name and avatar
- character stats with a radar chart
- daily energy controls with recent-history chart
- habit tracking with streaks and a calendar view
- journal entries with daily XP rewards
- settings for theme mode, accent color, export, and import

## Current structure

The live application is centered on a single dashboard flow:

- `src/App.tsx` mounts the application shell
- `src/GamifiedStatsDashboard.tsx` contains the main dashboard and settings UI
- `src/features/dashboard/dashboard-data.ts` contains persistence, sanitization, streak, calendar, and export/import helpers
- `src/ui-compat.tsx` contains lightweight UI wrappers used by the dashboard
- `src/styles.css` defines global theme tokens and base page styles

## Persistence

State is stored locally in `localStorage` and can also be exported as JSON.

Persisted data includes:

- profile name and avatar
- theme mode and accent
- XP progression
- radar stats
- daily energy and history
- habits and streak history
- journal entries
- rewarded journal dates

## Tech

- React
- TypeScript
- Vite
- Recharts
- Lucide React
- Tailwind utility classes via CDN config in `index.html`

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Main edit points

- dashboard behavior and UI: `src/GamifiedStatsDashboard.tsx`
- data model and persistence rules: `src/features/dashboard/dashboard-data.ts`
- UI wrappers: `src/ui-compat.tsx`
- theme variables: `src/styles.css`
