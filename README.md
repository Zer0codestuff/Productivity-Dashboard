# Productivity Dashboard

A gamified dashboard to track progress, habits, daily energy, and personal journaling in a single React interface.

![Site screenshot](./Screenshot%202026-03-19%20at%2017-13-00%20Momentum%20Journal.png)

## What it does

The project brings together several productivity blocks in one visual layout:

- profile with customizable name and image
- character stats with a radar chart
- daily energy with recent history
- habit tracker with streaks and XP
- daily journal with calendar and history
- `Settings` page for theme, accent, profile, and data export/import

The UI is kept compact but game-like, with a consistent look in both dark and light mode.

## Structure

The app’s main surface area lives here:

- `src/GamifiedStatsDashboard.tsx`

Supporting files and docs:

- `src/App.tsx` mounts the main dashboard
- `src/main.tsx` bootstraps React
- `src/styles.css` defines theme tokens, global colors, and dark/light mode
- `src/ui-compat.tsx` provides lightweight UI primitives used in the layout
- `project.md` is a deeper project map for AI-assisted review or quick orientation

## Features

### Dashboard

The main page uses a responsive three-column layout:

- left: profile, daily energy, accent, stat editing
- center: radar chart, seasonal phrase, daily energy chart
- right: XP, habits, banner, stats table

### Settings

Settings cover the main configuration:

- change display name
- change profile photo
- light or dark theme
- accent color
- export data
- import data

### Journal

The daily journal lets you:

- write today’s entry
- browse previous days
- use a calendar to open a specific day
- earn XP when you write
- get extra streak bonuses

## Data and persistence

The dashboard state is saved automatically to `localStorage`, not only via manual export/import.

Persisted data includes:

- profile
- theme
- accent
- XP and level
- radar stats
- daily energy
- energy history
- habits
- journal entries
- journal days already rewarded for XP

Export still produces a full JSON snapshot, useful for backup or migration.

## Tech stack

- React
- TypeScript
- Vite
- Recharts
- Lucide React
- Global CSS variables

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

The build outputs an optimized `dist/` folder.

## Where to edit

Typical touchpoints:

- main UI and logic: `src/GamifiedStatsDashboard.tsx`
- global colors and light/dark mode: `src/styles.css`
- base UI components: `src/ui-compat.tsx`
- project overview: `project.md`

## Note

The main UI is rendered directly from `src/GamifiedStatsDashboard.tsx`, with a small compatibility layer so the original design can run without a full rewrite.
