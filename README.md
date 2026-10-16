# Uttarakhand Vulnerability Atlas

An interactive web atlas of climate hazards, exposure, vulnerability and risk for the blocks of
Uttarakhand, India. Built for the GIZ-supported climate resilience programme.

- **Map explorer**: 112 layers across Climate, Hazard, Exposure, Vulnerability, Risk and
  Infrastructure/Assets, stackable with per-layer opacity and a legend.
- **Compare view**: two synchronised maps side by side.
- **Block detail panel**: click a block to see its indicator values in a chart.
- **Chatbot**: answers questions grounded in the project reports and block-level data.
- **About pages**: methodology, glossary and a stakeholder-consultation gallery.

> The map data is deliberately **not** shipped as public static files. It is served by a small
> token-gated backend (`server/`) so the full dataset cannot be bulk-downloaded. See
> [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Repository layout

| Path | What it is |
| --- | --- |
| `src/` | React front end (Vite + TypeScript) |
| `public/` | Static images: logos, consultation photos, about-page figures |
| `server/` | Express API: session tokens, tiles, GeoJSON, per-block data, chatbot |
| `server/tiles/` | Pre-rendered PMTiles archives, one per layer (about 690 MB in total) |
| `server/data/` | GeoJSON geometries, `indicators.json`, `layer-catalog.json` |
| `server/knowledge/` | Source reports the chatbot is grounded on |
| `.github/workflows/` | `deploy.yml` (GitHub Pages) and `keepalive.yml` (pings the API) |
| `render.yaml` | Render blueprint for the API |
| `docs/` | Detailed documentation (see below) |

## Quick start (local)

Requires **Node 22 or newer** (CI uses Node 24).

```bash
# 1. Backend
cd server
cp .env.example .env        # fill in the values, see docs/DEVELOPMENT.md
npm ci
npm run dev                 # http://localhost:8787

# 2. Front end (new terminal, repo root)
cp .env.example .env.local  # VITE_API_BASE_URL=http://localhost:8787
npm ci
npm run dev                 # http://localhost:5173/GIZcode/
```

`ALLOWED_ORIGINS` in `server/.env` must contain the exact origin the front end runs on
(for example `http://localhost:5173`), otherwise the API answers 403. The chatbot needs real Groq
and Upstash keys; the map itself works with placeholder values.

## Scripts

| Where | Command | Purpose |
| --- | --- | --- |
| root | `npm run dev` | Vite dev server |
| root | `npm run build` | Type-check and production build into `dist/` |
| root | `npm run lint` | Oxlint |
| root | `npm run preview` | Serve the production build locally |
| `server/` | `npm run dev` | API with auto-reload |
| `server/` | `npm run build` / `npm start` | Compile and run the API |
| `server/` | `npm run ingest` | Re-index the chatbot's documents |

## Deployment

- **Front end**: GitHub Pages via `.github/workflows/deploy.yml` on every push to `main`.
- **API**: Render (`render.yaml`, root directory `server/`).

Setup steps, required variables and common problems: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Documentation

| Doc | Contents |
| --- | --- |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | How the pieces fit together, request flow, security model |
| [docs/DATA.md](docs/DATA.md) | Layers, categories, render types, adding or updating a layer |
| [docs/API.md](docs/API.md) | Backend endpoints, auth, rate limits, caching, chatbot |
| [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) | Local setup, environment variables, conventions |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | GitHub Pages and Render setup, CI, keep-alive |
| [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) | Known problems and fixes |

## Tech stack

Front end: React 19, TypeScript, Vite, Tailwind CSS 4, MapLibre GL, PMTiles, Zustand, Recharts,
dnd-kit, React Router (hash routing). Back end: Express, Groq (LLM), Upstash Vector (retrieval).

## Credits

Developed with Deutsche Gesellschaft für Internationale Zusammenarbeit (GIZ) GmbH and partners
for the Government of Uttarakhand. Basemap: © CARTO, © OpenStreetMap contributors.
