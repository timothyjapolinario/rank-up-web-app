# RankUp Public Website

The RankUp public frontend is a read-only leaderboard and official match history. It is built with React, TypeScript, TanStack Router, and Tailwind CSS. All public data is loaded through asynchronous service interfaces backed by the sample dataset at `src/data/public.json`; the pages do not call the RankUp API.

## Run locally

```bash
npm install
npm run dev
```

Routes:

- `/` — hub leaderboard
- `/matches` — official match history, filterable by hub and player
- `/matches/:matchId` — match score and player rating changes

## Separate local admin app

The admin workspace is a separate project in `../rank-up-admin-webapp` and runs at [http://127.0.0.1:3001](http://127.0.0.1:3001). It stores admin data in the browser and does not require the API. After verifying results, export the public ZIP in the admin app and replace this project's `src/data/public.json` with the archive's `public.json` before building and publishing the public website.

## Public data

The sample JSON includes hubs, players with current records, and completed match results with team assignments and rating snapshots. Replace or publish this dataset as part of the frontend deployment when new public results are ready.

The async `HubService`, `LeaderboardService`, and `MatchService` contracts are defined alongside their static JSON implementation in `src/services/publicDataService.ts`. Pages depend on these contracts’ implementations rather than reading JSON directly, so a future API-backed implementation can be added without changing page components.

## Build

```bash
npm run build
```

## Deploy to GitHub Pages

The `Deploy to GitHub Pages` workflow builds and publishes this public website when changes are pushed to `master`. It does not deploy the separate admin app. In the repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**.

The workflow builds for the project site at `https://timothyjapolinario.github.io/rank-up-web-app/` and statically prerenders the routes, including match details from `src/data/public.json`.
