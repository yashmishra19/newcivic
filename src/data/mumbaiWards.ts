// Real BMC ward boundaries — loaded at runtime from /public/mumbaiWards.json
// This avoids TS having to parse/type-check the 856KB coordinate data.

export interface WardProperties {
  gid: number;
  wardId: string;
  wardName: string;
  zone: string;
  activeIssues: number;
  resolved: number;
  responseRate: number;
  avgResolution: number;
  reporters: number;
}

export type MumbaiWardsGeoJSON = GeoJSON.FeatureCollection<GeoJSON.Geometry, WardProperties>;

let _cache: MumbaiWardsGeoJSON | null = null;

export async function loadMumbaiWards(): Promise<MumbaiWardsGeoJSON> {
  if (_cache) return _cache;
  const res = await fetch('/mumbaiWards.json');
  if (!res.ok) throw new Error('Failed to load Mumbai ward data');
  _cache = await res.json() as MumbaiWardsGeoJSON;
  return _cache;
}
