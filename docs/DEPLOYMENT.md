# Deployment

Two parts are deployed separately: the static front end on GitHub Pages and the API on Render.

## 1. API on Render

1. Create a Render web service from this repo using `render.yaml` (root directory `server/`,
   build `npm install && npm run build`, start `npm start`).
2. Set the variables that `render.yaml` marks as not synced: `GROQ_API_KEY`,
   `UPSTASH_VECTOR_REST_URL`, `UPSTASH_VECTOR_REST_TOKEN`. `SESSION_SECRET` is generated for you.
3. Set `ALLOWED_ORIGINS` to the exact origin of every site that will use the API, comma
   separated, with no trailing slash and no path. For example:
   `https://a-nnurag.github.io,https://seedstechnicalservices.github.io,http://localhost:5173`.
4. Check `https://<your-service>.onrender.com/healthz` returns `{"ok":true}`.

Notes:

- The free plan sleeps after about 15 minutes idle and a cold start takes 30 to 60 seconds. The
  `keepalive.yml` workflow pings `/healthz` every 10 minutes to prevent this. If you change the
  Render URL, update it in that file.
- `server/tiles/` is about 690 MB; make sure the plan's disk and build limits allow it.

## 2. Front end on GitHub Pages

1. In the repo, open Settings, Pages, and set **Source** to **GitHub Actions**. Without this the
   deploy job fails with a 404 ("Ensure GitHub Pages has been enabled").
2. In Settings, Secrets and variables, Actions, Variables, add `VITE_API_BASE_URL` with the API's
   public URL (for example `https://gizcode.onrender.com`).
3. Push to `main`. `.github/workflows/deploy.yml` runs `npm ci` and `npm run build` on Node 24,
   then publishes `dist/`.

### Base path

`vite.config.ts` sets `base` to the repository name, because project sites are served from
`https://<owner>.github.io/<repo>/`. Today it is `/GIZcode/`. If the repo is named differently,
change it to `/<repo-name>/`; otherwise the page loads blank because its assets return 404.

### Pages on private repositories

GitHub Pages for a private repo needs an organization plan that supports it. If the Pages
setting is unavailable, make the repo public or change the plan.

## Release checklist

- [ ] `npm run build` passes locally.
- [ ] `ALLOWED_ORIGINS` on Render includes the site's origin.
- [ ] `VITE_API_BASE_URL` variable is set in the repo.
- [ ] `base` in `vite.config.ts` matches the repo name.
- [ ] After deploy, open the site, tick a layer from each category and confirm it draws.

## Rolling back

Revert the commit on `main`; the workflow redeploys the previous front end. For the API, use
Render's "Rollback" on the previous deploy.
