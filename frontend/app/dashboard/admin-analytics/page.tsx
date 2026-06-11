'use client';

import { useEffect, useState } from 'react';
import {
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import {
  AlertTriangle, BarChart3, Building2, CheckCircle2,
  Loader2, RefreshCw, Shield, TrendingUp, Users,
} from 'lucide-react';

import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { Button } from '@/components/ui/Button';
import { useAppSelector } from '@/store/hooks';
import apiClient from '@/lib/api/client';
import { cn } from '@/lib/utils';

// ── Palette ───────────────────────────────────────────────────────────────────
const PIE_COLORS = ['#f59e0b', '#22c55e', '#ef4444', '#6366f1', '#06b6d4'];
const LINE_COLORS = { submitted: '#6366f1', approved: '#22c55e', declined: '#ef4444' };
const BAR_COLOR = '#ef4444';

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({
  icon: Icon, label, value, color = 'text-foreground',
}: { icon: React.ElementType; label: string; value: number | string; color?: string }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-card px-5 py-4">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent/10">
        <Icon className="size-5 text-accent" />
      </div>
      <div>
        <p className="text-xs text-muted">{label}</p>
        <p className={cn('text-2xl font-bold', color)}>{value}</p>
      </div>
    </div>
  );
}

// ── Chart card wrapper ────────────────────────────────────────────────────────
function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h3 className="mb-1 font-heading text-base font-semibold text-foreground">{title}</h3>
      {subtitle && <p className="mb-4 text-xs text-muted">{subtitle}</p>}
      {children}
    </div>
  );
}

// ── Short month label ─────────────────────────────────────────────────────────
function shortMonth(key: string) {
  const [y, m] = key.split('-');
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleString('default', { month: 'short' });
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function AdminAnalyticsPage() {
  const { user } = useAppSelector((s) => s.auth);
  const isAdmin = user?.role === 'ADMIN';

  const [data, setData]     = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: res } = await apiClient.get('/analytics/admin');
      setData(res.data);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  if (!isAdmin) {
    return (
      <DashboardShell>
        <div className="flex items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 px-6 py-8 text-destructive">
          <Shield className="size-6 shrink-0" />
          <p className="font-medium">Admin access required.</p>
        </div>
      </DashboardShell>
    );
  }

  const totals = (data as { totals?: Record<string, number> })?.totals ?? {};
  const lifecycle   = ((data as { lifecycle?: unknown[] })?.lifecycle   ?? []) as { month: string; submitted: number; approved: number; declined: number }[];
  const statusDist  = ((data as { statusDist?: unknown[] })?.statusDist ?? []) as { name: string; value: number }[];
  const fraud       = ((data as { fraud?: unknown[] })?.fraud           ?? []) as { month: string; duplicates: number }[];
  const marketplace = ((data as { marketplace?: unknown[] })?.marketplace ?? []) as { month: string; forSale: number; forRent: number }[];

  return (
    <DashboardShell>
      <DashboardHeader
        title="Government Analytics"
        description="System-wide property lifecycle, fraud monitoring, and marketplace metrics."
        actions={
          <Button
            variant="outline" size="sm"
            leftIcon={loading ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
            onClick={() => void load()}
            disabled={loading}
          >
            Refresh
          </Button>
        }
      />

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertTriangle className="size-4 shrink-0" /> {error}
        </div>
      )}

      {loading && !data ? (
        <div className="flex items-center justify-center gap-2 py-20 text-muted">
          <Loader2 className="size-6 animate-spin" />
          <span>Loading analytics…</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stat strip */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard icon={Users}      label="Total users"       value={totals.totalUsers ?? 0} />
            <StatCard icon={Building2}  label="Properties"        value={totals.totalProperties ?? 0} />
            <StatCard icon={CheckCircle2} label="Requests"        value={totals.totalRequests ?? 0} />
            <StatCard icon={AlertTriangle} label="Duplicate docs" value={totals.totalDuplicates ?? 0} color="text-amber-500" />
          </div>

          {/* Row 1 */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* A. Property lifecycle line chart */}
            <ChartCard
              title="Property Lifecycle"
              subtitle="Monthly submission, approval, and decline trends"
            >
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={lifecycle.map(d => ({ ...d, month: shortMonth(d.month) }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="submitted" stroke={LINE_COLORS.submitted} strokeWidth={2} dot={false} name="Submitted" />
                  <Line type="monotone" dataKey="approved"  stroke={LINE_COLORS.approved}  strokeWidth={2} dot={false} name="Approved" />
                  <Line type="monotone" dataKey="declined"  stroke={LINE_COLORS.declined}  strokeWidth={2} dot={false} name="Declined" />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* B. Status distribution pie */}
            <ChartCard
              title="Property Status Distribution"
              subtitle="Current state of all registered properties"
            >
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={statusDist}
                    cx="50%" cy="50%"
                    innerRadius={60} outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {statusDist.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Row 2 */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* C. Fraud / duplicate monitoring bar */}
            <ChartCard
              title="Fraud / Duplicate Detection"
              subtitle="Monthly count of duplicate-flagged document submissions"
            >
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={fraud.map(d => ({ ...d, month: shortMonth(d.month) }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="duplicates" fill={BAR_COLOR} radius={[4, 4, 0, 0]} name="Duplicates" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* D. Marketplace volume line */}
            <ChartCard
              title="Marketplace Volume Trend"
              subtitle="Approved properties listed for sale or rent each month"
            >
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={marketplace.map(d => ({ ...d, month: shortMonth(d.month) }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="forSale" stroke="#22c55e" strokeWidth={2} dot={false} name="For Sale" />
                  <Line type="monotone" dataKey="forRent" stroke="#06b6d4" strokeWidth={2} dot={false} name="For Rent" />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
