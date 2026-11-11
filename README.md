# RankUp Public Website

The RankUp public frontend is a read-only leaderboard and official match history. It is built with React, TypeScript, TanStack Router, and Tailwind CSS. Public data is fetched at runtime from `https://data.timothy-apolinario.com/public.json`; the pages do not call the RankUp API.

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

The admin workspace is a separate project in `../rank-up-admin-webapp` and runs at [http://127.0.0.1:3001](http://127.0.0.1:3001). It stores admin data in the browser and does not require the API. After verifying results, export the public ZIP and publish its `public.json` to the data URL above.

## Public data

The remote JSON includes hubs, players with current records, and completed match results with team assignments and rating snapshots. The data host must allow browser requests from `https://rank-up.timothy-apolinario.com` by returning an appropriate `Access-Control-Allow-Origin` response header.

The async `HubService`, `LeaderboardService`, and `MatchService` contracts and their remote JSON implementation are defined in `src/services/publicDataService.ts`.

## Build

```bash
npm run build
```

## Deploy to GitHub Pages

The `Deploy to GitHub Pages` workflow builds and publishes this public website when changes are pushed to `master`. It does not deploy the separate admin app. In the repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**.

The workflow builds for the custom domain at `https://rank-up.timothy-apolinario.com/` and statically prerenders the public routes. Match details are loaded from the remote dataset at runtime.
