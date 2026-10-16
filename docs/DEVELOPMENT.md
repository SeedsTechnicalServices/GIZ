# Development

## Prerequisites

- Node 22 or newer (CI uses Node 24; Vite 8 needs 20.19 or newer and MapLibre's style
  dependencies ask for Node 22 or newer).
- npm. Both `package-lock.json` files are committed; use `npm ci`, not `npm install`.

## Environment variables

### Front end (`.env.local` in the repo root, gitignored)

| Variable | Meaning |
| --- | --- |
| `VITE_API_BASE_URL` | Base URL of the backend, for example `http://localhost:8787`. The app throws on start if it is missing. |

### Back end (`server/.env`, gitignored; template in `server/.env.example`)

| Variable | Required | Meaning |
| --- | --- | --- |
| `SESSION_SECRET` | yes | Signs session tokens. Generate with `openssl rand -hex 32`. |
| `ALLOWED_ORIGINS` | yes | Comma-separated origins allowed to get a token and call the API. |
| `GROQ_API_KEY` | yes | Key for the chatbot's LLM calls (console.groq.com). |
| `UPSTASH_VECTOR_REST_URL` | yes | Upstash Vector index URL. Use an index with an embedding model attached. |
| `UPSTASH_VECTOR_REST_TOKEN` | yes | Token for that index. |
| `CHAT_MODEL` | no | Overrides the default `openai/gpt-oss-120b`. |
| `PORT` | no | Defaults to 8787. |

The server refuses to start if a required variable is missing. For map-only work you can use
placeholder values for the Groq and Upstash settings; only the chatbot needs real ones.

## Running locally

```bash
cd server && cp .env.example .env && npm ci && npm run dev
# new terminal, repo root
echo "VITE_API_BASE_URL=http://localhost:8787" > .env.local
npm ci && npm run dev
```

Open the URL Vite prints (it includes the `/GIZcode/` base path). If Vite chooses a port other
than 5173 because it is busy, add that origin to `ALLOWED_ORIGINS` and restart the server.

## Checks before a pull request

```bash
npm run lint
npm run build          # type-checks and builds the front end
cd server && npx tsc -p tsconfig.json --noEmit
```

## Conventions

- Layer behaviour is data-driven. Prefer editing `src/config/layers.config.json` over adding
  per-layer code.
- Every request to the backend goes through `apiFetch()` in `src/lib/apiClient.ts`. Do not call
  `fetch` on the API directly.
- Never add the indicator table or other bulk data to `public/` or the front-end bundle; it
  defeats the access control described in [ARCHITECTURE.md](ARCHITECTURE.md).
- The chatbot replies in plain text. Do not add Markdown to its prompt or rendering without
  changing both.
- Large files in `server/tiles/` are committed directly. Keep each under GitHub's 100 MB limit.

## Updating the chatbot's knowledge

Put PDF, DOCX or text files in `server/knowledge/`, set the Upstash variables in `server/.env`
and run `npm run ingest` from `server/`. This updates the hosted index, so the live chatbot
changes without a redeploy.
