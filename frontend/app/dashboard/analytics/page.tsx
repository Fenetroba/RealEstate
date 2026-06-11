'use client';

import { useEffect, useState } from 'react';
import {
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import {
  AlertTriangle, Building2, CheckCircle2,
  ClipboardList, Loader2, RefreshCw, TrendingUp,
} from 'lucide-react';

import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { Button } from '@/components/ui/Button';
import apiClient from '@/lib/api/client';
import { cn } from '@/lib/utils';

// ── Palette ───────────────────────────────────────────────────────────────────
const PIE_COLORS  = ['#22c55e', '#f59e0b', '#ef4444'];
const LINE_BLUE   = '#6366f1';
const LINE_GREEN  = '#22c55e';
const BAR_AMBER   = '#f59e0b';

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

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h3 className="mb-1 font-heading text-base font-semibold text-foreground">{title}</h3>
      {subtitle && <p className="mb-4 text-xs text-muted">{subtitle}</p>}
      {children}
    </div>
  );
}

function shortMonth(key: string) {
  const [y, m] = key.split('-');
  return new Date(Number(y), Number(m) - 1, 1).toLocaleString('default', { month: 'short' });
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function UserAnalyticsPage() {
  const [data, setData]       = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading]  = useState(true);
  const [error, setError]      = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: res } = await apiClient.get('/analytics/user');
      setData(res.data);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const totals          = (data as { totals?: Record<string, number> })?.totals ?? {};
  const assetOverview   = ((data as { assetOverview?: unknown[] })?.assetOverview   ?? []) as { name: string; value: number }[];
  const requestActivity = ((data as { requestActivity?: unknown[] })?.requestActivity ?? []) as { month: string; submitted: number; approved: number }[];
  const valueGrowth     = ((data as { valueGrowth?: unknown[] })?.valueGrowth     ?? []) as { month: string; properties: number }[];
  const ownershipAlerts = ((data as { ownershipAlerts?: unknown[] })?.ownershipAlerts ?? []) as { month: string; duplicates: number }[];

  return (
    <DashboardShell>
      <DashboardHeader
        title="My Analytics"
        description="Personal property portfolio, submission history, and ownership alerts."
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

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertTriangle className="size-4 shrink-0" /> {error}
        </div>
      )}

      {loading && !data ? (
        <div className="flex items-center justify-center gap-2 py-20 text-muted">
          <Loader2 className="size-6 animate-spin" />
          <span>Loading your analytics…</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stat strip */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard icon={Building2}    label="My properties"  value={totals.totalMyProperties ?? 0} />
            <StatCard icon={CheckCircle2} label="Approved"       value={totals.totalApproved ?? 0}     color="text-green-600" />
            <StatCard icon={ClipboardList} label="Pending"       value={totals.totalPending ?? 0}      color="text-amber-500" />
            <StatCard icon={AlertTriangle} label="Declined"      value={totals.totalDeclined ?? 0}     color="text-destructive" />
          </div>

          {/* Row 1 */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* A. Asset overview pie */}
            <ChartCard
              title="My Asset Overview"
              subtitle="Distribution of your properties by status"
            >
              {assetOverview.length === 0 ? (
                <div className="flex h-52 items-center justify-center text-sm text-muted">
                  No properties yet — submit your first registration request.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={assetOverview}
                      cx="50%" cy="50%"
                      innerRadius={55} outerRadius={95}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {assetOverview.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            {/* B. Request activity line */}
            <ChartCard
              title="Personal Transaction History"
              subtitle="Requests submitted vs. approved over the last 6 months"
            >
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={requestActivity.map(d => ({ ...d, month: shortMonth(d.month) }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="submitted" stroke={LINE_BLUE}  strokeWidth={2} dot={false} name="Submitted" />
                  <Line type="monotone" dataKey="approved"  stroke={LINE_GREEN} strokeWidth={2} dot={false} name="Approved" />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Row 2 */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* C. Property value growth (cumulative approved) */}
            <ChartCard
              title="Property Portfolio Growth"
              subtitle="Cumulative approved properties over time"
            >
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={valueGrowth.map(d => ({ ...d, month: shortMonth(d.month) }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="properties" stroke={LINE_GREEN} strokeWidth={2} dot={{ r: 3 }} name="Properties" />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* D. Ownership alerts bar */}
            <ChartCard
              title="Ownership Alerts"
              subtitle="Duplicate-flagged documents in your property submissions"
            >
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={ownershipAlerts.map(d => ({ ...d, month: shortMonth(d.month) }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="duplicates" fill={BAR_AMBER} radius={[4, 4, 0, 0]} name="Alerts" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
