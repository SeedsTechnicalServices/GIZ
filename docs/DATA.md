# Data and layers

## Categories

| Category id | Nav label | Layers | Sub-groups |
| --- | --- | --- | --- |
| `climate` | Climate | 25 | temperature, precipitation (historical and four SSP scenarios) |
| `hazards` | Hazard | 16 | drought, extreme rainfall, extreme temperature, flood, forest fire, landslide, plus a composite and hazard-extent masks |
| `exposure` | Exposure | 41 | agriculture, energy, forest and biodiversity, healthcare, roads, tourism, water |
| `vulnerability_scores` | Vulnerability | 6 | agriculture, energy, healthcare, roads, water, plus a composite |
| `risk_scores` | Risk | 6 | agriculture, energy, healthcare, roads, water, plus a composite |
| `infrastructure` | Asset (pinned panel) | 18 | raw points, lines and polygons |

That is 112 layers in total. The counts come from `src/config/layers.config.json`.

## Render types

| `renderType` | How it is shown | Data source |
| --- | --- | --- |
| `choropleth` | Block polygons coloured by class break | raster tiles |
| `proportional-dot` | Dots at block centroids, sized and coloured by value | raster tiles |
| `flat-extent` | Single-colour hazard-extent mask | raster tiles |
| `raw-lines`, `raw-polygons` | Single-colour assets (roads, drainage, protected areas) | raster tiles |
| `raw-points` | Clustered points | GeoJSON through `/api/data/` |

## Files

| File | Purpose |
| --- | --- |
| `server/tiles/<layer-id>.pmtiles` | Pre-rendered raster tiles for each layer (zoom 0 to 12). `blocks.pmtiles` and `districts.pmtiles` are vector archives for boundaries and click selection. |
| `server/data/blocks.geojson` | 95 block polygons with `bpcode`, `bpname`, `dtcode`, `dtname`, `stcode`, `stname`. |
| `server/data/districts.geojson` | District boundaries. |
| `server/data/indicators.json` | `{ bpcode: { layerId: value } }` for all blocks. Never sent in bulk. |
| `server/data/infrastructure-assets/*.geojson` | Asset geometries (only the point files are served). |
| `server/data/layer-catalog.json` | Layer ids, labels and units used by the chatbot tools. |
| `src/config/layers.config.json` | Layer definitions used by the front end. |

## Layer definition fields

```jsonc
{
  "id": "hazard_drought",            // also the tile file name: hazard_drought.pmtiles
  "label": "Drought Risk",
  "category": "hazards",
  "subgroup": "drought",             // or null
  "pinned": false,                   // pinned layers are active at start
  "sourceShapefile": "Portal data_1/.../Block Wise Drought Risk.shp",
  "geometrySource": "blocks",        // blocks | centroids | standalone
  "geometryFile": "infrastructure-assets/schools.geojson", // raw-points only
  "unit": "%",                       // % | score | count | none
  "renderType": "choropleth",
  "colorRamp": ["#2E7D32", "#FBC02D", "#F57C00", "#D32F2F"],
  "breaks": [8.65, 33.33, 62.5],
  "classification": "quantile",      // quantile | jenks | fixed
  "defaultOpacity": 0.75,
  "defaultVisible": false,
  "description": "...",
  "dataQualityNote": null            // shown to users when set
}
```

## Adding or updating a layer

1. Produce the tile archive, name it `<id>.pmtiles` and put it in `server/tiles/`. The scripts that
   render the tiles are part of the separate data-pipeline project and are not in this repo.
2. Add the block values to `server/data/indicators.json` (not needed for raw or extent layers).
3. Add the layer to `server/data/layer-catalog.json` so the chatbot can find it.
4. Add the definition to `src/config/layers.config.json`. For a new sub-group, also update
   `src/config/categories.ts`.
5. For a `raw-points` layer, add the GeoJSON file and list it in `ALLOWED_FILES` in
   `server/src/routes/data.ts`.
6. Run `npm run build`. The Zod schema rejects malformed entries.

## Consistency checks

Every layer needs a matching tile (or, for point layers, an allowlisted GeoJSON file), an entry in
`layer-catalog.json` and, for value layers, a key in `indicators.json`. At the time of writing all
112 layers pass these checks.

## Data sources

Layers are derived from the shapefiles named in each layer's `sourceShapefile` and from the
reports in `server/knowledge/`. Check `dataQualityNote` in the config for known limitations of
individual layers.
