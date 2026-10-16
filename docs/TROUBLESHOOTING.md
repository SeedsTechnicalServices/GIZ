# Troubleshooting

## The page is blank after deploying to a new repository

The `base` in `vite.config.ts` does not match the repo name, so the JS and CSS return 404. Set it
to `/<repo-name>/` and redeploy.

## "VITE_API_BASE_URL is not set"

The build or dev server has no backend URL. Locally, create `.env.local`. In CI, add the
`VITE_API_BASE_URL` repository variable (Settings, Secrets and variables, Actions, Variables).

## Every data request fails, or "Origin not allowed" / 403

The origin is missing from `ALLOWED_ORIGINS` on the server. Add the exact origin (scheme, host and
port, no trailing slash) and restart or redeploy the server. A different dev port also needs to be
added.

## Layers take a long time to appear, or stay blank

- The Render free plan may be asleep. The first request after idle takes 30 to 60 seconds. The
  keep-alive workflow prevents this; check that it is enabled in the Actions tab.
- Each large layer is 8 to 10 MB and is read in pieces. The first view of a layer is slower than
  later ones, which come from the browser cache.
- Untick and tick the layer again after the server has woken up.
- In the browser's Network tab, look for failed or red `.pmtiles` requests.

## GitHub Actions: "npm error Cannot read properties of null (reading 'edgesOut')"

npm 10 crashes when resolving the dependency tree without a lockfile. The repo now commits
`package-lock.json` and the workflow uses `npm ci` on Node 24. If it returns, regenerate the
lockfile with `npm install --package-lock-only` and commit it.

## GitHub Actions: deploy job fails with 404 "Ensure GitHub Pages has been enabled"

Pages is not enabled for the repo. Settings, Pages, Source: GitHub Actions. Then re-run the job.

## `git clone` fails with "'$GIT_DIR' too big" on Windows

The working directory path is too long. Clone into a short path such as `C:\src\GIZcode`.

## Server will not start: "Missing required environment variable"

Fill in every required value in `server/.env` (see [DEVELOPMENT.md](DEVELOPMENT.md)).

## Chatbot says it cannot answer

It only answers from the indexed reports and block data. Check the Groq and Upstash variables, and
re-run `npm run ingest` if documents were added. It declines questions outside climate risk and the
atlas data by design.

## Rate limited (429)

Limits are per IP (tiles, data, session) or per token (block info, chat); see [API.md](API.md).
Wait a minute and retry.
