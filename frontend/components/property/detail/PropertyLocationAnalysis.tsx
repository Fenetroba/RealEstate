'use client';

import { useCallback, useState } from 'react';
import {
  AlertTriangle, Building2, ChevronDown, ChevronUp,
  Loader2, MapPin, RefreshCw, ShieldCheck,
} from 'lucide-react';

import {
  analyzeLocation,
  CATEGORY_META,
  type AmenityCategory,
  type NearbyAnalysis,
  type NearbyPlace,
} from '@/lib/overpass';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

// ── Score gauge ───────────────────────────────────────────────────────────────

function ScoreGauge({ score }: { score: number }) {
  const color =
    score >= 75 ? 'text-green-600'
    : score >= 50 ? 'text-amber-500'
    : 'text-destructive';

  const label =
    score >= 75 ? 'Excellent'
    : score >= 60 ? 'Good'
    : score >= 40 ? 'Fair'
    : 'Poor';

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
      <div className="relative flex size-20 shrink-0 items-center justify-center">
        <svg viewBox="0 0 36 36" className="size-20 -rotate-90">
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--color-border)" strokeWidth="3" />
          <circle
            cx="18" cy="18" r="15.9"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray={`${score} 100`}
            strokeLinecap="round"
            className={color}
          />
        </svg>
        <span className={cn('absolute text-xl font-bold', color)}>{score}</span>
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted">Accessibility Score</p>
        <p className={cn('text-2xl font-bold', color)}>{label}</p>
        <p className="mt-0.5 text-xs text-muted">
          Based on proximity to hospitals, schools, transport, markets & banks
        </p>
      </div>
    </div>
  );
}

// ── Category section ──────────────────────────────────────────────────────────

function CategorySection({
  category, places,
}: {
  category: AmenityCategory;
  places: NearbyPlace[];
}) {
  const [expanded, setExpanded] = useState(false);
  const meta = CATEGORY_META[category];
  const nearest = places[0];
  if (!nearest) return null;

  const shown = expanded ? places : places.slice(0, 1);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((p) => !p)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface"
      >
        <span className="text-xl">{meta.icon}</span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">{meta.label}</p>
          <p className="text-xs text-muted">
            Nearest: {nearest.name} · {nearest.distanceLabel}
          </p>
        </div>
        <span className="text-xs text-muted">{places.length} found</span>
        {places.length > 1 && (
          expanded
            ? <ChevronUp className="size-4 shrink-0 text-muted" />
            : <ChevronDown className="size-4 shrink-0 text-muted" />
        )}
      </button>

      {shown.map((place, i) => (
        <div
          key={place.id}
          className={cn(
            'flex items-start gap-3 border-t border-border px-4 py-3',
            i === 0 && 'bg-accent/5',
          )}
        >
          {i === 0 && (
            <span className="mt-0.5 shrink-0 rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-bold text-primary">
              NEAREST
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground">{place.name}</p>
            {place.address && (
              <p className="text-xs text-muted truncate">{place.address}</p>
            )}
          </div>
          <div className="shrink-0 text-right">
            <p className="text-sm font-semibold text-foreground">{place.distanceLabel}</p>
            <p className="text-xs text-muted">~{place.travelMinWalk} min walk</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Quick stats strip ─────────────────────────────────────────────────────────

function QuickStats({ analysis }: { analysis: NearbyAnalysis }) {
  const key: [AmenityCategory, string][] = [
    ['hospital',  '🏥'],
    ['school',    '🏫'],
    ['bus_stop',  '🚌'],
    ['pharmacy',  '💊'],
    ['bank',      '🏦'],
    ['market',    '🛒'],
  ];

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
      {key.map(([cat, icon]) => {
        const nearest = analysis.nearestByCategory[cat];
        return (
          <div
            key={cat}
            className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card px-2 py-3 text-center"
          >
            <span className="text-xl">{icon}</span>
            <p className="text-xs font-semibold text-foreground leading-tight">
              {nearest ? nearest.distanceLabel : 'None'}
            </p>
            <p className="text-[10px] text-muted leading-tight">
              {CATEGORY_META[cat].label.replace(/s$/, '')}
            </p>
          </div>
        );
      })}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface PropertyLocationAnalysisProps {
  lat: number;
  lng: number;
}

export function PropertyLocationAnalysis({ lat, lng }: PropertyLocationAnalysisProps) {
  const [open,     setOpen]     = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [analysis, setAnalysis] = useState<NearbyAnalysis | null>(null);
  const [error,    setError]    = useState<string | null>(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeLocation(lat, lng);
      setAnalysis(result);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch nearby amenities. Try again.',
      );
    } finally {
      setLoading(false);
    }
  }, [lat, lng]);

  const handleToggle = () => {
    setOpen((prev) => {
      const next = !prev;
      if (next && !analysis && !loading) void run();
      return next;
    });
  };

  // Group places by category
  const byCategory: Partial<Record<AmenityCategory, NearbyPlace[]>> = {};
  if (analysis) {
    for (const place of analysis.places) {
      if (!byCategory[place.category]) byCategory[place.category] = [];
      byCategory[place.category]!.push(place);
    }
  }

  const categoryOrder: AmenityCategory[] = [
    'hospital', 'clinic', 'school', 'university',
    'bank', 'pharmacy', 'police', 'fire_station',
    'shopping', 'market', 'bus_stop', 'road',
  ];

  return (
    <div className="mt-4">
      {/* Toggle button */}
      <button
        type="button"
        onClick={handleToggle}
        className={cn(
          'flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left',
          'transition-colors hover:bg-surface',
          open ? 'border-accent/40 bg-accent/5' : 'border-border bg-card',
        )}
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <MapPin className="size-4 text-accent" />
          Nearby Amenities & Accessibility Analysis
        </span>
        <span className="flex items-center gap-2 text-xs text-muted">
          {loading && <Loader2 className="size-4 animate-spin" />}
          Powered by OpenStreetMap
          {open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </span>
      </button>

      {/* Panel content */}
      {open && (
        <div className="mt-3 space-y-4">
          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted">
              <Loader2 className="size-5 animate-spin text-accent" />
              Searching nearby places… (Overpass API)
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <div>
                <p className="font-semibold">Analysis failed</p>
                <p className="mt-0.5 text-xs">{error}</p>
                <button
                  type="button"
                  onClick={() => void run()}
                  className="mt-2 flex items-center gap-1 text-xs underline hover:no-underline"
                >
                  <RefreshCw className="size-3" /> Try again
                </button>
              </div>
            </div>
          )}

          {/* Results */}
          {analysis && !loading && (
            <>
              {/* Accessibility score */}
              <ScoreGauge score={analysis.accessibilityScore} />

              {/* Quick stats */}
              <QuickStats analysis={analysis} />

              {/* Per-category details */}
              <div className="space-y-2">
                {categoryOrder.map((cat) => {
                  const places = byCategory[cat];
                  if (!places?.length) return null;
                  return <CategorySection key={cat} category={cat} places={places} />;
                })}
              </div>

              {analysis.places.length === 0 && (
                <div className="rounded-xl border border-border bg-card px-4 py-8 text-center text-sm text-muted">
                  <Building2 className="mx-auto mb-2 size-8 opacity-40" />
                  No amenities found within the search radius.
                  This area may be rural or not well-mapped in OpenStreetMap yet.
                </div>
              )}

              {/* Refresh + attribution */}
              <div className="flex items-center justify-between text-xs text-muted">
                <span>
                  Data © <a
                    href="https://www.openstreetmap.org/copyright"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >OpenStreetMap</a> contributors
                </span>
                <button
                  type="button"
                  onClick={() => void run()}
                  className="flex items-center gap-1 hover:text-foreground"
                >
                  <RefreshCw className="size-3" /> Refresh
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
