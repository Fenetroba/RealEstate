'use client';

/**
 * LocationPicker — 100% FREE, no API key required.
 *
 * Services used:
 *  • OpenStreetMap tiles        — free, no key
 *  • Nominatim geocoding API    — free, OpenStreetMap's search service
 *  • Open-Elevation API         — free elevation data
 *  • react-leaflet + Leaflet    — free open-source map library
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { AlertTriangle, Loader2, MapPin, Mountain, Navigation, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface LocationData {
  address:   string;
  latitude:  number;
  longitude: number;
  elevation: number | null;
  placeId:   string;          // Nominatim place_id (string)
}

interface LocationPickerProps {
  value:     LocationData | null;
  onChange:  (data: LocationData) => void;
  error?:    string;
  disabled?: boolean;
  /** Not used — kept for API compatibility with Google version */
  apiKey?:   string;
}

// ── Nominatim suggestion ──────────────────────────────────────────────────────

interface NominatimResult {
  place_id:     number;
  display_name: string;
  lat:          string;
  lon:          string;
}

// ── Free Elevation API ────────────────────────────────────────────────────────

async function fetchElevation(lat: number, lng: number): Promise<number | null> {
  try {
    // open-elevation.com — completely free
    const res  = await fetch(
      `https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lng}`,
    );
    if (!res.ok) throw new Error('elevation fetch failed');
    const data = await res.json() as { results?: { elevation: number }[] };
    const el   = data.results?.[0]?.elevation;
    return el != null ? Math.round(el * 10) / 10 : null;
  } catch {
    return null;
  }
}

// ── Nominatim search ──────────────────────────────────────────────────────────

async function nominatimSearch(query: string): Promise<NominatimResult[]> {
  if (query.length < 3) return [];
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=6`;
    const res = await fetch(url, {
      headers: { 'Accept-Language': 'en', 'User-Agent': 'EDENET-RealEstate/1.0' },
    });
    return (await res.json()) as NominatimResult[];
  } catch {
    return [];
  }
}

// ── Reverse geocode (drag) ────────────────────────────────────────────────────

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { 'Accept-Language': 'en', 'User-Agent': 'EDENET-RealEstate/1.0' } },
    );
    const data = await res.json() as { display_name?: string };
    return data.display_name ?? `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  } catch {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }
}

// ── Dynamic Leaflet map (SSR-safe) ────────────────────────────────────────────

interface LeafletMapProps {
  position:  [number, number];
  onDragEnd: (lat: number, lng: number) => void;
}

const LeafletMap = dynamic<LeafletMapProps>(
  () => import('@/components/maps/LeafletMapInner'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-surface">
        <Loader2 className="size-6 animate-spin text-accent" />
      </div>
    ),
  },
);

// ── Main component ────────────────────────────────────────────────────────────

export function LocationPicker({ value, onChange, error, disabled }: LocationPickerProps) {
  const [inputValue,   setInputValue]   = useState(value?.address ?? '');
  const [suggestions,  setSuggestions]  = useState<NominatimResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searching,    setSearching]    = useState(false);
  const [fetchingElev, setFetchingElev] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync input when external value changes
  useEffect(() => {
    if (value?.address) setInputValue(value.address);
  }, [value?.address]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Debounced Nominatim search
  const handleInputChange = (val: string) => {
    setInputValue(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.length < 3) { setSuggestions([]); setShowDropdown(false); return; }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      const results = await nominatimSearch(val);
      setSuggestions(results);
      setShowDropdown(results.length > 0);
      setSearching(false);
    }, 400);
  };

  const handleSelectSuggestion = useCallback(async (result: NominatimResult) => {
    const lat  = parseFloat(result.lat);
    const lng  = parseFloat(result.lon);
    const addr = result.display_name;

    setInputValue(addr);
    setShowDropdown(false);
    setSuggestions([]);

    setFetchingElev(true);
    const elevation = await fetchElevation(lat, lng);
    setFetchingElev(false);

    onChange({
      address:   addr,
      latitude:  lat,
      longitude: lng,
      elevation,
      placeId:   String(result.place_id),
    });
  }, [onChange]);

  const handleMapDrag = useCallback(async (lat: number, lng: number) => {
    setFetchingElev(true);
    const [address, elevation] = await Promise.all([
      reverseGeocode(lat, lng),
      fetchElevation(lat, lng),
    ]);
    setFetchingElev(false);

    setInputValue(address);
    onChange({
      address,
      latitude:  lat,
      longitude: lng,
      elevation,
      placeId:   value?.placeId ?? '',
    });
  }, [onChange, value?.placeId]);

  const position: [number, number] = value
    ? [value.latitude, value.longitude]
    : [9.03, 38.74]; // default: Addis Ababa

  return (
    <div className="space-y-3">
      {/* Search input with suggestions */}
      <div ref={containerRef} className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
          {searching
            ? <Loader2 className="size-4 animate-spin text-muted" />
            : <Search className="size-4 text-muted" />
          }
        </div>

        <input
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          placeholder="Search for a location…"
          disabled={disabled}
          autoComplete="off"
          className={cn(
            'w-full rounded-xl border bg-background py-2.5 pl-9 pr-8 text-sm text-foreground',
            'placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent transition-colors',
            error ? 'border-destructive focus:ring-destructive' : 'border-border',
            disabled && 'cursor-not-allowed opacity-60',
          )}
        />

        {inputValue && (
          <button
            type="button"
            onClick={() => { setInputValue(''); setSuggestions([]); setShowDropdown(false); }}
            className="absolute inset-y-0 right-2.5 flex items-center text-muted hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        )}

        {/* Suggestions dropdown */}
        {showDropdown && suggestions.length > 0 && (
          <ul className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-border bg-card shadow-lg">
            {suggestions.map((s) => (
              <li key={s.place_id}>
                <button
                  type="button"
                  onClick={() => void handleSelectSuggestion(s)}
                  className="flex w-full items-start gap-2 px-3 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-surface"
                >
                  <MapPin className="mt-0.5 size-3.5 shrink-0 text-accent" />
                  <span className="line-clamp-2">{s.display_name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-destructive">
          <AlertTriangle className="size-3.5 shrink-0" /> {error}
        </p>
      )}

      {/* Selected location info */}
      {value && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg bg-surface px-3 py-2 text-xs text-muted">
          <span className="flex items-center gap-1">
            <Navigation className="size-3 text-accent" />
            {value.latitude.toFixed(6)}, {value.longitude.toFixed(6)}
          </span>
          {fetchingElev ? (
            <span className="flex items-center gap-1">
              <Loader2 className="size-3 animate-spin" /> Fetching elevation…
            </span>
          ) : value.elevation != null ? (
            <span className="flex items-center gap-1">
              <Mountain className="size-3 text-accent" />
              {value.elevation} m
            </span>
          ) : null}
        </div>
      )}

      {/* Map */}
      <div className="overflow-hidden rounded-xl border border-border" style={{ height: 280 }}>
        <LeafletMap
          position={position}
          onDragEnd={handleMapDrag}
        />
      </div>

      <p className="text-xs text-muted">
        Powered by{' '}
        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
          OpenStreetMap
        </a>
        {' '}· Drag the marker to adjust location
      </p>
    </div>
  );
}
