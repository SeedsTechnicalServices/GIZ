import { Router } from 'express';
import path from 'node:path';
import { config } from '../config';

// Matches both today's vector archives (blocks.pmtiles, districts.pmtiles) and the
// future per-layer raster archives (layer-<id>.pmtiles) — same gated route either way,
// since res.sendFile + Range support don't care whether the bytes decode to vector or
// raster tiles.
const TILE_NAME_PATTERN = /^[a-z0-9_-]+\.pmtiles$/;

export const tilesRouter = Router();

tilesRouter.get('/:name', (req, res) => {
  const { name } = req.params;
  if (!TILE_NAME_PATTERN.test(name)) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  // Tile archives only change on redeploy, so let the browser reuse them. `private` keeps
  // them out of shared caches (access is token-gated). Overrides the global noStore.
  res.setHeader('Cache-Control', 'private, max-age=86400');
  res.removeHeader('Pragma');
  res.sendFile(path.join(config.tilesDir, name), (err) => {
    if (err && !res.headersSent) {
      res.status(404).json({ error: 'Not found' });
    }
  });
});
