# Backend API

Base URL: the value of `VITE_API_BASE_URL` (production: `https://gizcode.onrender.com`).
Every `/api/*` route except `/api/session` needs an `Authorization: Bearer <token>` header.

| Method and path | Auth | Limit | Description |
| --- | --- | --- | --- |
| `GET /healthz` | none | none | `{ "ok": true }`. Used by the keep-alive workflow. |
| `POST /api/session` | origin check | 20 per 10 min | Returns `{ token, expiresAt }`. 403 unless `Origin` or `Referer` is in `ALLOWED_ORIGINS`. |
| `GET /api/tiles/:name.pmtiles` | token | 1200 per min | PMTiles archive with `Range` support. The name must match `^[a-z0-9_-]+\.pmtiles$`. |
| `GET /api/data/<file>` | token | 300 per min | Allowlisted GeoJSON only (blocks, districts, point assets). |
| `GET /api/block-info/:bpcode` | token | 30 per min per token | `{ bpcode, values: { layerId: number } }` |
| `POST /api/chat` | token | 15 per min per token | Body `{ messages: [{ role, content }], selectedBpcode? }`, response `{ reply }`. At most 20 messages of 2000 characters. |

Errors: 401 invalid or expired token (the client mints a new one and retries once), 403 origin not
allowed, 404 unknown file, 400 invalid input, 429 rate limited.

## Caching

- Default for every response: `Cache-Control: no-store`.
- Tiles: `private, max-age=86400`. A 404 stays `no-store`.
- CORS preflight: `Access-Control-Max-Age: 7200`.

Tile archives only change when the server is redeployed. To make browsers refetch a replaced
archive, give the file a new name or lower the max-age.

## Chatbot

`/api/chat` embeds the last user message, retrieves the 4 closest report chunks from Upstash
Vector, adds the selected block's data, and runs a Groq tool-calling loop (at most 4 rounds) with
these tools:

- `get_block_data(query)`: one block by name, district or bpcode. Returns a candidate list if the
  name is ambiguous.
- `get_district_summary(district, layerId)`: mean, min and max of one layer across a district.
- `rank_blocks(layerId, direction, topN)`: the highest or lowest blocks statewide, capped at 10.

Replies are plain text because the widget does not render Markdown. After changing files in
`server/knowledge/`, run `npm run ingest` from `server/` to re-index them.
