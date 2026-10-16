# Architecture

```
 Browser (GitHub Pages)                        API (Render, server/)
┌─────────────────────────┐  POST /api/session  ┌───────────────────────────┐
│ React + MapLibre        │ ──────────────────▶ │ signs a 15-minute token   │
│  apiClient.ts (token)   │ ◀────────────────── │ (origin must be allowed)  │
│                         │   Bearer <token>    │                           │
│  pmtilesProtocol.ts     │ ── Range requests ─▶ │ /api/tiles/<layer>.pmtiles│
│  data.ts                │ ──────────────────▶ │ /api/data/*.geojson       │
│  BlockDetailPanel       │ ──────────────────▶ │ /api/block-info/<bpcode>  │
│  ChatWidget             │ ──────────────────▶ │ /api/chat → Upstash, Groq │
└─────────────────────────┘                     └───────────────────────────┘
```

## Front end (`src/`)

- `App.tsx`: hash routes `/` (map), `/about/:slug` and `/about/consultation`. Hash routing is used
  because GitHub Pages cannot rewrite unknown paths to `index.html`.
- `components/MapApp`, `MapView`: the map. `MapView/baseSources.ts` adds the `blocks` and
  `districts` vector sources, `layerSync.ts` adds and removes data layers, and `useLayerSync.ts`
  keeps MapLibre in step with the store and enforces z-order.
- `components/CategoryNav`, `LayerPanel`, `Sidebar`, `Legend`: layer selection, opacity,
  drag-and-drop ordering and legends.
- `components/CompareView`: two synchronised maps.
- `components/BlockDetailPanel`: loads one block's indicators when the block is selected.
- `components/Chatbot`: chat widget that talks to `/api/chat`.
- `config/layers.config.json`: the source of truth for layers. `config/layers.ts` validates it
  with Zod at startup and fails the dev server or build if it is malformed.
  `config/categories.ts` defines categories, sub-groups and labels.
- `state/`: Zustand stores (active layers, opacity, selection, compare mode).
- `lib/apiClient.ts`: the only module that knows about session tokens; everything else calls
  `apiFetch()`. `lib/pmtilesProtocol.ts` registers the `pmtiles://` protocol with the same token.
- `content/aboutPages.ts`: text for the About pages.

## Back end (`server/src/`)

- `index.ts`: Express app. CORS, then a default `no-store` header, then routes. `/healthz` is the
  unauthenticated health check.
- `middleware/session.ts` and `lib/token.ts`: HMAC-signed, origin-bound tokens with a 15-minute
  lifetime.
- `middleware/rateLimit.ts`: per-route limits (see [API.md](API.md)).
- `routes/tiles.ts`: serves `server/tiles/*.pmtiles` with HTTP Range support.
- `routes/data.ts`: serves a fixed allowlist of GeoJSON files (never a directory listing).
- `routes/blockInfo.ts`: one block's indicator values per request.
- `routes/chat.ts`: retrieval from Upstash Vector plus a Groq tool-calling loop (at most 4 rounds).
- `lib/tools.ts`: chatbot tools `get_block_data`, `get_district_summary`, `rank_blocks`.

## How a layer is drawn

Almost every layer is a **pre-rendered raster PMTiles archive**. The colouring (class breaks and
colour ramp) is baked in on the server side, so the browser never receives the underlying
indicator table. MapLibre loads each archive as a `raster` source through the `pmtiles://`
protocol.

The exception is `raw-points` layers (schools, power stations, springs and so on). They need
MapLibre's client-side clustering, which only works on GeoJSON sources, so their geometry is
fetched from `/api/data/infrastructure-assets/*.geojson`.

## Security model

The aim is to stop casual bulk download of the dataset, not to hide it from a determined user.

- No dataset in the static front-end bundle.
- Sessions are only issued to allowed origins (`ALLOWED_ORIGINS`). Tokens expire after
  15 minutes and are refreshed automatically by the client.
- Analytical values are only available one block at a time and are rate-limited per token.
- Tile requests are rate-limited and file names are validated (`^[a-z0-9_-]+\.pmtiles$`).
- The chatbot treats retrieved text, tool output and user messages as data, not instructions.
