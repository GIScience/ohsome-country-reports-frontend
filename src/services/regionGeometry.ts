import { PMTiles } from "pmtiles";
import { VectorTile } from "@mapbox/vector-tile";
import { PbfReader } from "pbf";
import union from "@turf/union";
import { featureCollection } from "@turf/helpers";
import type { Feature, MultiPolygon, Polygon, Position } from "geojson";

/**
 * A region's outline, read back out of the boundaries pmtiles the map draws
 * (the app has no other copy of the geometry - the parquet files only carry
 * values keyed by geomID). Used to hand the selected region over to the
 * ohsome dashboard.
 *
 * Vector tiles cut every polygon at tile edges, so the region is collected
 * from all tiles it touches and the pieces are unioned back together. The
 * zoom is the deepest one at which the region still fits in a handful of
 * tiles: detailed enough for a quality analysis, small enough for a URL.
 */

type BBox = [number, number, number, number]; // minLon, minLat, maxLon, maxLat
export type RegionGeometry = Polygon | MultiPolygon;

// Tiles fetched per step. The coarse pass covers the whole country to find
// the region's extent, the detail pass covers just the region.
const COARSE_MAX_TILES = 4;
const DETAIL_MAX_TILES = 9;
// Beyond this, extra detail only makes the dashboard URL longer.
const MAX_DETAIL_ZOOM = 11;
// ~1 m - plenty for an area of interest, and keeps the URL short.
const COORD_DECIMALS = 5;

const pmtilesCache = new Map<string, PMTiles>();
const geometryCache = new Map<string, Promise<RegionGeometry | null>>();

function getPMTiles(url: string): PMTiles {
  let pm = pmtilesCache.get(url);
  if (!pm) {
    pm = new PMTiles(url);
    pmtilesCache.set(url, pm);
  }
  return pm;
}

function lonToTileX(lon: number, z: number): number {
  const n = 2 ** z;
  return Math.min(n - 1, Math.max(0, Math.floor(((lon + 180) / 360) * n)));
}

function latToTileY(lat: number, z: number): number {
  const n = 2 ** z;
  const rad = (Math.max(-85.0511, Math.min(85.0511, lat)) * Math.PI) / 180;
  const y = Math.floor(((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * n);
  return Math.min(n - 1, Math.max(0, y));
}

function tilesFor(bbox: BBox, z: number): [number, number][] {
  const tiles: [number, number][] = [];
  for (let x = lonToTileX(bbox[0], z); x <= lonToTileX(bbox[2], z); x++) {
    for (let y = latToTileY(bbox[3], z); y <= latToTileY(bbox[1], z); y++) {
      tiles.push([x, y]);
    }
  }
  return tiles;
}

/** Deepest zoom in [minZ, maxZ] at which bbox is covered by at most maxTiles tiles. */
function deepestZoom(bbox: BBox, minZ: number, maxZ: number, maxTiles: number): number {
  let best = minZ;
  for (let z = minZ; z <= maxZ; z++) {
    if (tilesFor(bbox, z).length > maxTiles) break;
    best = z;
  }
  return best;
}

async function regionPieces(pm: PMTiles, layer: string, geomId: string, z: number, tiles: [number, number][]) {
  const perTile = await Promise.all(tiles.map(async ([x, y]) => {
    const tile = await pm.getZxy(z, x, y);
    if (!tile?.data) return [];
    const vtLayer = new VectorTile(new PbfReader(new Uint8Array(tile.data))).layers[layer];
    if (!vtLayer) return [];
    const pieces: Feature<RegionGeometry>[] = [];
    for (let i = 0; i < vtLayer.length; i++) {
      const feature = vtLayer.feature(i);
      // Same key the map selects by (promoteId: "id" in MetricMap).
      if (String(feature.properties.id ?? feature.id) !== geomId) continue;
      const geojson = feature.toGeoJSON(x, y, z);
      if (geojson.geometry.type === "Polygon" || geojson.geometry.type === "MultiPolygon") {
        pieces.push(geojson as Feature<RegionGeometry>);
      }
    }
    return pieces;
  }));
  return perTile.flat();
}

function piecesBBox(pieces: Feature<RegionGeometry>[]): BBox {
  const bbox: BBox = [Infinity, Infinity, -Infinity, -Infinity];
  const visit = (coords: unknown): void => {
    if (typeof (coords as number[])[0] === "number") {
      const [lon, lat] = coords as number[];
      bbox[0] = Math.min(bbox[0], lon); bbox[1] = Math.min(bbox[1], lat);
      bbox[2] = Math.max(bbox[2], lon); bbox[3] = Math.max(bbox[3], lat);
    } else {
      (coords as unknown[]).forEach(visit);
    }
  };
  pieces.forEach(p => visit(p.geometry.coordinates));
  return bbox;
}

/** Rounds coordinates and drops the consecutive duplicates that rounding creates. */
function roundRing(ring: Position[]): Position[] {
  const factor = 10 ** COORD_DECIMALS;
  const out: Position[] = [];
  for (const [lon, lat] of ring) {
    const p = [Math.round(lon * factor) / factor, Math.round(lat * factor) / factor];
    const prev = out[out.length - 1];
    if (!prev || prev[0] !== p[0] || prev[1] !== p[1]) out.push(p);
  }
  return out;
}

function roundGeometry(geometry: RegionGeometry): RegionGeometry {
  return geometry.type === "Polygon"
    ? { type: "Polygon", coordinates: geometry.coordinates.map(roundRing) }
    : { type: "MultiPolygon", coordinates: geometry.coordinates.map(poly => poly.map(roundRing)) };
}

async function loadUncached(pmtilesUrl: string, layer: string, geomId: string, countryBBox: BBox): Promise<RegionGeometry | null> {
  const pm = getPMTiles(pmtilesUrl);
  const header = await pm.getHeader();
  const maxZ = Math.min(header.maxZoom, MAX_DETAIL_ZOOM);

  const coarseZ = deepestZoom(countryBBox, header.minZoom, maxZ, COARSE_MAX_TILES);
  const coarse = await regionPieces(pm, layer, geomId, coarseZ, tilesFor(countryBBox, coarseZ));
  if (coarse.length === 0) return null;

  const regionBBox = piecesBBox(coarse);
  const detailZ = deepestZoom(regionBBox, coarseZ, maxZ, DETAIL_MAX_TILES);
  const pieces = detailZ === coarseZ
    ? coarse
    : await regionPieces(pm, layer, geomId, detailZ, tilesFor(regionBBox, detailZ));
  if (pieces.length === 0) return null;

  const merged = pieces.length === 1 ? pieces[0] : union(featureCollection(pieces));
  return merged ? roundGeometry(merged.geometry) : null;
}

/**
 * Outline of one region (by the map's geomID) in a pmtiles layer, or null if
 * it can't be found. countryBBox is the pmtiles' own bounds (getPMTilesBounds).
 * Cached per file/layer/region.
 */
export function loadRegionGeometry(pmtilesUrl: string, layer: string, geomId: string, countryBBox: BBox): Promise<RegionGeometry | null> {
  const key = `${pmtilesUrl}|${layer}|${geomId}`;
  let cached = geometryCache.get(key);
  if (!cached) {
    cached = loadUncached(pmtilesUrl, layer, geomId, countryBBox).catch((e) => {
      console.error("Failed to load region geometry:", e);
      geometryCache.delete(key);
      return null;
    });
    geometryCache.set(key, cached);
  }
  return cached;
}
