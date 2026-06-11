/**
 * lib/overpass.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Queries the Overpass API (OpenStreetMap) for nearby amenities.
 * 100% free — no API key required.
 * Rate limit: ~1 req/sec per IP (we batch all categories in ONE request).
 */

export interface NearbyPlace {
  id:       number;
  name:     string;
  category: AmenityCategory;
  lat:      number;
  lng:      number;
  address:  string;
  distanceM: number;       // meters from property
  distanceLabel: string;   // "250 m" or "1.2 km"
  travelMinWalk: number;   // walking minutes (~5 km/h)
}

export type AmenityCategory =
  | 'hospital'
  | 'clinic'
  | 'school'
  | 'university'
  | 'bank'
  | 'pharmacy'
  | 'police'
  | 'fire_station'
  | 'shopping'
  | 'market'
  | 'bus_stop'
  | 'road';

// ── Category config ───────────────────────────────────────────────────────────

export const CATEGORY_META: Record<AmenityCategory, {
  label: string;
  icon:  string;
  color: string;
  radiusM: number;   // search radius in metres
  tag:   string;     // Overpass amenity/shop/highway tag
  tagType: 'amenity' | 'shop' | 'highway' | 'public_transport';
}> = {
  hospital:     { label: 'Hospitals',        icon: '🏥', color: '#ef4444', radiusM: 5000, tag: 'hospital',      tagType: 'amenity' },
  clinic:       { label: 'Clinics',          icon: '🩺', color: '#f97316', radiusM: 2000, tag: 'clinic',        tagType: 'amenity' },
  school:       { label: 'Schools',          icon: '🏫', color: '#3b82f6', radiusM: 2000, tag: 'school',        tagType: 'amenity' },
  university:   { label: 'Universities',     icon: '🎓', color: '#6366f1', radiusM: 5000, tag: 'university',    tagType: 'amenity' },
  bank:         { label: 'Banks',            icon: '🏦', color: '#22c55e', radiusM: 2000, tag: 'bank',          tagType: 'amenity' },
  pharmacy:     { label: 'Pharmacies',       icon: '💊', color: '#ec4899', radiusM: 2000, tag: 'pharmacy',      tagType: 'amenity' },
  police:       { label: 'Police Stations',  icon: '🚔', color: '#1d4ed8', radiusM: 3000, tag: 'police',        tagType: 'amenity' },
  fire_station: { label: 'Fire Stations',    icon: '🚒', color: '#dc2626', radiusM: 5000, tag: 'fire_station',  tagType: 'amenity' },
  shopping:     { label: 'Shopping Centers', icon: '🛍️', color: '#f59e0b', radiusM: 3000, tag: 'mall',          tagType: 'shop'    },
  market:       { label: 'Markets',          icon: '🛒', color: '#84cc16', radiusM: 1500, tag: 'supermarket',   tagType: 'shop'    },
  bus_stop:     { label: 'Bus Stops',        icon: '🚌', color: '#06b6d4', radiusM: 1000, tag: 'bus_stop',      tagType: 'amenity' },
  road:         { label: 'Main Roads',       icon: '🛣️', color: '#78716c', radiusM: 500,  tag: 'primary',       tagType: 'highway' },
};

// ── Distance helpers ──────────────────────────────────────────────────────────

/** Haversine distance in metres */
export function distanceM(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R  = 6371000;
  const dL = ((lat2 - lat1) * Math.PI) / 180;
  const dG = ((lng2 - lng1) * Math.PI) / 180;
  const a  =
    Math.sin(dL / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dG / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDistance(m: number): string {
  return m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`;
}

export function walkMinutes(m: number): number {
  return Math.round(m / (5000 / 60)); // 5 km/h
}

// ── Overpass query (all categories in one request) ────────────────────────────

function buildOverpassQuery(lat: number, lng: number): string {
  const parts: string[] = ['[out:json][timeout:20];('];

  for (const [, meta] of Object.entries(CATEGORY_META)) {
    const r = meta.radiusM;
    if (meta.tagType === 'amenity') {
      parts.push(`  node[amenity=${meta.tag}](around:${r},${lat},${lng});`);
      parts.push(`  way[amenity=${meta.tag}](around:${r},${lat},${lng});`);
    } else if (meta.tagType === 'shop') {
      parts.push(`  node[shop=${meta.tag}](around:${r},${lat},${lng});`);
      parts.push(`  way[shop=${meta.tag}](around:${r},${lat},${lng});`);
    } else if (meta.tagType === 'highway') {
      parts.push(`  way[highway=${meta.tag}](around:${r},${lat},${lng});`);
    }
  }

  parts.push(');out center 5 per cat;');
  // Simpler query — just get everything and limit overall
  return `[out:json][timeout:25];(
    node[amenity~"hospital|clinic|school|university|bank|pharmacy|police|fire_station|bus_stop"](around:5000,${lat},${lng});
    way[amenity~"hospital|clinic|school|university|bank|pharmacy|police|fire_station"](around:5000,${lat},${lng});
    node[shop~"mall|supermarket"](around:3000,${lat},${lng});
    way[shop~"mall|supermarket"](around:3000,${lat},${lng});
    way[highway="primary"](around:500,${lat},${lng});
    way[highway="secondary"](around:500,${lat},${lng});
  );out center 80;`;
}

interface OverpassElement {
  type:   'node' | 'way' | 'relation';
  id:     number;
  lat?:   number;
  lon?:   number;
  center?: { lat: number; lon: number };
  tags?:  Record<string, string>;
}

/** Map an Overpass element's tags to our AmenityCategory */
function tagToCategory(tags: Record<string, string>): AmenityCategory | null {
  const a = tags.amenity;
  const s = tags.shop;
  const h = tags.highway;

  if (a === 'hospital')        return 'hospital';
  if (a === 'clinic')          return 'clinic';
  if (a === 'school')          return 'school';
  if (a === 'university')      return 'university';
  if (a === 'bank')            return 'bank';
  if (a === 'pharmacy')        return 'pharmacy';
  if (a === 'police')          return 'police';
  if (a === 'fire_station')    return 'fire_station';
  if (a === 'bus_stop')        return 'bus_stop';
  if (s === 'mall')            return 'shopping';
  if (s === 'supermarket')     return 'market';
  if (h === 'primary' || h === 'secondary') return 'road';
  return null;
}

// ── Main export ───────────────────────────────────────────────────────────────

export interface NearbyAnalysis {
  places:           NearbyPlace[];
  nearestByCategory: Partial<Record<AmenityCategory, NearbyPlace>>;
  accessibilityScore: number;
  fetchedAt:        string;
}

export async function analyzeLocation(lat: number, lng: number): Promise<NearbyAnalysis> {
  const query = buildOverpassQuery(lat, lng);
  const res   = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body:   `data=${encodeURIComponent(query)}`,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  if (!res.ok) throw new Error(`Overpass API error: ${res.status}`);
  const data = await res.json() as { elements: OverpassElement[] };

  const places: NearbyPlace[] = [];
  const seen = new Set<string>();

  for (const el of data.elements) {
    if (!el.tags) continue;
    const category = tagToCategory(el.tags);
    if (!category) continue;

    // Get coords (node has lat/lon directly; way has center)
    const elLat = el.lat ?? el.center?.lat;
    const elLng = el.lon ?? el.center?.lon;
    if (elLat == null || elLng == null) continue;

    const name = el.tags.name ?? el.tags['name:en'] ?? CATEGORY_META[category].label.slice(0, -1);
    const key  = `${category}-${name}-${elLat.toFixed(4)}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const dm     = distanceM(lat, lng, elLat, elLng);
    const address = [
      el.tags['addr:street'],
      el.tags['addr:housenumber'],
      el.tags['addr:city'],
    ].filter(Boolean).join(', ') || el.tags['addr:full'] || '';

    places.push({
      id:            el.id,
      name,
      category,
      lat:           elLat,
      lng:           elLng,
      address,
      distanceM:     dm,
      distanceLabel: formatDistance(dm),
      travelMinWalk: walkMinutes(dm),
    });
  }

  // Sort by distance within each category
  places.sort((a, b) => a.distanceM - b.distanceM);

  // Nearest per category
  const nearestByCategory: Partial<Record<AmenityCategory, NearbyPlace>> = {};
  for (const p of places) {
    if (!nearestByCategory[p.category]) nearestByCategory[p.category] = p;
  }

  return {
    places,
    nearestByCategory,
    accessibilityScore: computeScore(nearestByCategory),
    fetchedAt: new Date().toISOString(),
  };
}

// ── Accessibility score (0–100) ───────────────────────────────────────────────

function scoreDistance(distM: number | undefined, idealM: number, worstM: number): number {
  if (distM == null) return 0;
  if (distM <= idealM) return 100;
  if (distM >= worstM) return 0;
  return Math.round(100 * (1 - (distM - idealM) / (worstM - idealM)));
}

function computeScore(nearest: Partial<Record<AmenityCategory, NearbyPlace>>): number {
  const weights: { cat: AmenityCategory; weight: number; ideal: number; worst: number }[] = [
    { cat: 'hospital',   weight: 25, ideal: 2000,  worst: 10000 },
    { cat: 'school',     weight: 20, ideal: 500,   worst: 3000  },
    { cat: 'bus_stop',   weight: 20, ideal: 300,   worst: 2000  },
    { cat: 'market',     weight: 15, ideal: 500,   worst: 3000  },
    { cat: 'bank',       weight: 10, ideal: 500,   worst: 3000  },
    { cat: 'pharmacy',   weight: 10, ideal: 500,   worst: 2000  },
  ];

  let totalWeight = 0;
  let totalScore  = 0;

  for (const w of weights) {
    const place = nearest[w.cat];
    totalScore  += w.weight * scoreDistance(place?.distanceM, w.ideal, w.worst);
    totalWeight += w.weight;
  }

  return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
}
