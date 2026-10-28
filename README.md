# Cuerda

[![Build](https://github.com/mylatinflutesmusic/guitarmaster/actions/workflows/build.yml/badge.svg)](https://github.com/mylatinflutesmusic/guitarmaster/actions/workflows/build.yml)

A practice planner for classical guitarists. It takes the minutes you actually
have and decides what they are worth: which technique work, which piece, which
method, in an order that does not overload the hands.

Static, client-only React + TypeScript + Vite. No backend, no account, no network
calls at runtime — everything lives on the device.

## Running it

```bash
npm install
npm run dev        # http://127.0.0.1:5178
```

Other scripts:

| Command | What it does |
| --- | --- |
| `npm run build` | Typecheck, then build the static site into `dist/` |
| `npm run preview` | Serve the built `dist/` locally |
| `npm run typecheck` | `tsc --noEmit` only |

Requires Node 18 or newer. The lockfile is npm's, so use `npm ci` if you want an
exact install.

## What is in the app

- **Setup** — level, default session length, practice days, limiting areas,
  optional goal date. Runs once, editable later from the header.
- **Today** — the session for today, rebuilt if you change the time you have.
  Blocks open to show how to do them, why they earn the minutes, and what
  "done" looks like. The runner adds a timer, a metronome and a one-line note.
- **Week** — the whole week, phase, coverage and warnings (hand load, missing
  technique areas, stale repertoire, no sight-reading).
- **Pieces** — the repertoire, with state, priority, a deadline, the piece the
  plan is built around, and the techniques it demands.
- **Progress** — minutes, streaks, and tempo marks: the bpm you actually reached.
- **Library** — the technique entries behind the plan, with their prescriptions.

## Data

Everything is stored in `localStorage` under `cuerda.state.v1` (schema version
`1`). It is per browser and per device: clearing site data, using private
browsing, or switching device starts you from an empty state, and there is no
sync or export. `src/store/model.ts` holds the load/save and the version check;
a version mismatch falls back to a fresh state rather than guessing.

## Deploying

The site is static files served by a Worker:

- `deploy/worker.js` — a fetch handler that serves the built assets via
  `env.ASSETS.fetch(request)`.
- `freebuff.deploy.json` — the deploy manifest: entrypoint `index.js` (the
  worker), `assetsDirectory: "./dist"`, `spa: true`.
- `deploy/site.json` — the site id and preview/production URLs.

Build before deploying, because the manifest uploads `dist/` and nothing else:

```bash
npm run build
```

Deployment itself is published through Freebuff Sites for this project; the
built output is uploaded from `dist/`, which is git-ignored.

To check the worker and assets against the same configuration locally (no cloud
credentials involved):

```bash
npx wrangler dev --config deploy/wrangler.local-test.jsonc --port 8799
```

## Layout

```
src/
  engine/    plan.ts (week + session builder), stats.ts (totals, tempo), dates.ts
  data/      library.ts (techniques), methods.ts (practice methods), starters.ts
  store/     model.ts (persisted state), plus the React context in store.tsx
  components/ SessionRunner, BlockCard, PieceSheet, Sheet, TabBar, Icon
  views/     Setup, Today, Week, Pieces, Progress, Library
deploy/      Worker entry and local test config
public/      icons and web manifest
```

## Version control

The repository's baseline is tagged `v0.1`. To see what has changed since, or to
go back:

```bash
git diff v0.1
git switch -c restore v0.1   # inspect the baseline on its own branch
git reset --hard v0.1        # move main back to it, discarding later commits
```
