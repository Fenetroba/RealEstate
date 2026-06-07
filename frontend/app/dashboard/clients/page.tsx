'use client';

import { useMemo, useState } from 'react';
import { Mail, Users } from 'lucide-react';

import {
  DashboardOverviewStats,
  type DashboardOverviewStat,
} from '@/components/dashboard/DashboardOverviewStats';
import {
  DashboardDataTable,
  DashboardTableBody,
  DashboardTableHead,
  DashboardTableRow,
  DashboardTd,
  DashboardTh,
} from '@/components/dashboard/DashboardDataTable';
import { DashboardEmptyState } from '@/components/dashboard/DashboardEmptyState';
import { DashboardFilterTabs } from '@/components/dashboard/DashboardFilterTabs';
import { DashboardFiltersBar } from '@/components/dashboard/DashboardFiltersBar';
import { DashboardSearchField } from '@/components/dashboard/DashboardSearchField';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardPanel } from '@/components/dashboard/DashboardPanel';
import { DashboardSectionLabel } from '@/components/dashboard/DashboardSectionLabel';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { Button } from '@/components/ui/Button';
import { FilterSelectDropdown } from '@/components/ui/FilterSelectDropdown';
import { Badge } from '@/components/ui/Badge';
import { useDashboardSearch } from '@/hooks/useDashboardSearch';
import { dashboardPanelClass } from '@/lib/constants/dashboard-layout';
import { cn, getInitials } from '@/lib/utils';

interface Client {
  id: string;
  name: string;
  email: string;
  type: 'BUYER' | 'OWNER';
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
}

const mockClients: Client[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@example.com',
    type: 'BUYER',
    status: 'ACTIVE',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    type: 'OWNER',
    status: 'ACTIVE',
  },
  {
    id: '3',
    name: 'Mike Chen',
    email: 'mike@example.com',
    type: 'BUYER',
    status: 'PENDING',
  },
  {
    id: '4',
    name: 'Elena Rossi',
    email: 'elena@example.com',
    type: 'OWNER',
    status: 'INACTIVE',
  },
];

type StatusFilter = 'ALL' | Client['status'];
type TypeFilter = 'ALL' | Client['type'];

const typeFilterOptions = [
  { value: 'ALL', label: 'All types' },
  { value: 'BUYER', label: 'Buyers' },
  { value: 'OWNER', label: 'Owners' },
];

function countByStatus(clients: Client[], status: StatusFilter): number {
  if (status === 'ALL') return clients.length;
  return clients.filter((c) => c.status === status).length;
}

const emailActionClass = cn(
  'inline-flex items-center gap-1.5 rounded-md border border-border/80 px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors',
  'hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30',
);

export default function ClientsPage() {
  const search = useDashboardSearch();
  const [filterStatus, setFilterStatus] = useState<StatusFilter>('ALL');
  const [filterType, setFilterType] = useState<TypeFilter>('ALL');

  const filteredClients = useMemo(
    () =>
      mockClients.filter((client) => {
        const q = search.appliedQuery.toLowerCase().trim();
        const tokens = q ? q.split(/\s+/).filter(Boolean) : [];
        const matchesSearch =
          tokens.length === 0 ||
          tokens.every(
            (token) =>
              client.name.toLowerCase().includes(token) ||
              client.email.toLowerCase().includes(token),
          );
        const matchesStatus = filterStatus === 'ALL' || client.status === filterStatus;
        const matchesType = filterType === 'ALL' || client.type === filterType;
        return matchesSearch && matchesStatus && matchesType;
      }),
    [search.appliedQuery, filterStatus, filterType],
  );

  const stats: DashboardOverviewStat[] = useMemo(() => {
    const active = mockClients.filter((c) => c.status === 'ACTIVE').length;
    const pending = mockClients.filter((c) => c.status === 'PENDING').length;
    return [
      { label: 'Total clients', value: String(mockClients.length) },
      { label: 'Active', value: String(active), positive: true },
      { label: 'Pending', value: String(pending) },
    ];
  }, []);

  const statusTabs = useMemo(
    () =>
      (['ALL', 'ACTIVE', 'PENDING', 'INACTIVE'] as const).map((id) => ({
        id,
        label:
          id === 'ALL'
            ? 'All'
            : id.charAt(0) + id.slice(1).toLowerCase(),
        count: countByStatus(mockClients, id),
      })),
    [],
  );

  const hasActiveFilters =
    search.appliedQuery.length > 0 || filterStatus !== 'ALL' || filterType !== 'ALL';

  const clearFilters = () => {
    search.clearSearch();
    setFilterStatus('ALL');
    setFilterType('ALL');
  };

  return (
    <DashboardShell>
      <DashboardHeader
        title="Clients"
        description="Platform client directory (admin). CRM data will connect here later."
      />

      <section className={cn(dashboardPanelClass, 'mb-8')}>
        <DashboardSectionLabel className="mb-6 block">At a glance</DashboardSectionLabel>
        <DashboardOverviewStats stats={stats} />
      </section>

      <DashboardFilterTabs
        className="mb-0 pb-1"
        options={statusTabs}
        value={filterStatus}
        onChange={(id) => setFilterStatus(id as StatusFilter)}
      />

      <DashboardFiltersBar className="!mt-10">
        <DashboardSearchField
          name="clients-search"
          placeholder="Search by name or email…"
          aria-label="Search clients"
          value={search.queryInput}
          onChange={search.setQueryInput}
          onSearch={search.runSearch}
          onClear={search.clearSearch}
        />
        <FilterSelectDropdown
          value={filterType}
          onChange={(v) => setFilterType(v as TypeFilter)}
          options={typeFilterOptions}
          aria-label="Filter by client type"
          className="w-44 shrink-0"
        />
        {hasActiveFilters ? (
          <Button
            type="button"
            variant="ghost"
            size="lg"
            className="h-11 shrink-0"
            onClick={clearFilters}
          >
            Clear filters
          </Button>
        ) : null}
      </DashboardFiltersBar>

      {hasActiveFilters && filteredClients.length > 0 ? (
        <p className="-mt-4 mb-4 text-sm text-muted">
          Showing {filteredClients.length} of {mockClients.length} — press Search or Enter; use
          multiple words (e.g. <span className="font-medium">john buyer</span>).
        </p>
      ) : null}

      <DashboardPanel title={`Clients (${filteredClients.length})`} bodyClassName="p-0">
        {filteredClients.length === 0 ? (
          <DashboardEmptyState
            icon={Users}
            title="No clients found"
            description="Try another status, type, or search term."
            action={
              hasActiveFilters ? (
                <Button type="button" variant="primary" onClick={clearFilters}>
                  Clear filters
                </Button>
              ) : undefined
            }
            className="border-0"
          />
        ) : (
          <DashboardDataTable minWidth="min-w-[36rem]">
            <DashboardTableHead>
              <tr>
                <DashboardTh>Client</DashboardTh>
                <DashboardTh>Type</DashboardTh>
                <DashboardTh>Status</DashboardTh>
                <DashboardTh className="text-right">Contact</DashboardTh>
              </tr>
            </DashboardTableHead>
            <DashboardTableBody>
              {filteredClients.map((client) => {
                const [first, last] = client.name.split(' ');
                return (
                  <DashboardTableRow key={client.id}>
                    <DashboardTd>
                      <div className="flex items-center gap-3">
                        <div className="gradient-gold flex size-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white">
                          {getInitials(first, last || '')}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground">{client.name}</p>
                          <p className="truncate text-sm text-muted">{client.email}</p>
                        </div>
                      </div>
                    </DashboardTd>
                    <DashboardTd>
                      <Badge variant={client.type === 'BUYER' ? 'default' : 'gold'} size="sm">
                        {client.type}
                      </Badge>
                    </DashboardTd>
                    <DashboardTd>
                      <Badge
                        variant={
                          client.status === 'ACTIVE'
                            ? 'success'
                            : client.status === 'PENDING'
                              ? 'warning'
                              : 'default'
                        }
                        size="sm"
                      >
                        {client.status}
                      </Badge>
                    </DashboardTd>
                    <DashboardTd className="text-right">
                      <a href={`mailto:${client.email}`} className={emailActionClass}>
                        <Mail className="size-4 shrink-0" aria-hidden />
                        Email
                      </a>
                    </DashboardTd>
                  </DashboardTableRow>
                );
              })}
            </DashboardTableBody>
          </DashboardDataTable>
        )}
      </DashboardPanel>
    </DashboardShell>
  );
}
