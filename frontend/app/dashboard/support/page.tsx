'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  CheckCircle2, ChevronDown, ChevronUp, Clock, Loader2,
  MessageCircle, RefreshCw, Send, Shield, User,
} from 'lucide-react';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardEmptyState } from '@/components/dashboard/DashboardEmptyState';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAppSelector } from '@/store/hooks';
import { supportApi, type SupportTicket, type TicketStatus } from '@/lib/api/support';
import { cn, formatRelativeTime } from '@/lib/utils';

// ── Status badge ──────────────────────────────────────────────────────────────
const STATUS_VARIANTS: Record<TicketStatus, 'warning' | 'default' | 'verified' | 'outline'> = {
  OPEN:        'warning',
  IN_PROGRESS: 'default',
  RESOLVED:    'verified',
  CLOSED:      'outline',
};

// ── Filters ───────────────────────────────────────────────────────────────────
const FILTERS: { id: TicketStatus | 'ALL'; label: string }[] = [
  { id: 'ALL',         label: 'All' },
  { id: 'OPEN',        label: 'Open' },
  { id: 'IN_PROGRESS', label: 'In Progress' },
  { id: 'RESOLVED',    label: 'Resolved' },
  { id: 'CLOSED',      label: 'Closed' },
];

// ── Ticket card ───────────────────────────────────────────────────────────────
function TicketCard({
  ticket,
  onStatusChange,
}: {
  ticket: SupportTicket;
  onStatusChange: (id: string, status: TicketStatus) => Promise<void>;
}) {
  const [expanded,    setExpanded]    = useState(false);
  const [reply,       setReply]       = useState('');
  const [sending,     setSending]     = useState(false);
  const [messages,    setMessages]    = useState(ticket.messages);
  const [updating,    setUpdating]    = useState(false);

  const handleSend = async () => {
    if (!reply.trim()) return;
    setSending(true);
    try {
      const msg = await supportApi.addMessage(ticket.id, reply);
      setMessages((prev) => [...prev, msg]);
      setReply('');
    } catch { /* silent */ }
    finally { setSending(false); }
  };

  const handleStatus = async (status: TicketStatus) => {
    setUpdating(true);
    await onStatusChange(ticket.id, status);
    setUpdating(false);
  };

  const lastMsg = messages[messages.length - 1];

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {/* Header row */}
      <button
        type="button"
        onClick={() => setExpanded((p) => !p)}
        className="flex w-full items-start gap-4 px-5 py-4 text-left transition-colors hover:bg-surface"
      >
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent/10">
          <MessageCircle className="size-5 text-accent" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-foreground truncate">{ticket.subject}</p>
            <Badge variant={STATUS_VARIANTS[ticket.status]} size="sm">
              {ticket.status.replace('_', ' ')}
            </Badge>
          </div>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
            <User className="size-3 shrink-0" />
            {ticket.guestName ?? ticket.guestEmail ?? ticket.userId?.slice(0, 8) ?? 'Anonymous'}
            {' · '}
            <Clock className="size-3 shrink-0" />
            {formatRelativeTime(ticket.updatedAt)}
            {' · '}
            {(ticket._count?.messages ?? messages.length)} message(s)
          </p>
          {!expanded && lastMsg && (
            <p className="mt-1 text-xs text-muted line-clamp-1">
              {lastMsg.isAdmin ? '↩ You: ' : '↪ User: '}{lastMsg.body}
            </p>
          )}
        </div>

        {expanded ? <ChevronUp className="size-4 shrink-0 text-muted mt-1" /> : <ChevronDown className="size-4 shrink-0 text-muted mt-1" />}
      </button>

      {/* Expanded thread */}
      {expanded && (
        <div className="border-t border-border">
          {/* Contact info */}
          {(ticket.guestEmail || ticket.userId) && (
            <div className="bg-surface px-5 py-2 text-xs text-muted">
              {ticket.guestEmail && <span>Email: <strong className="text-foreground">{ticket.guestEmail}</strong></span>}
              {ticket.userId && <span>User ID: <strong className="text-foreground">{ticket.userId}</strong></span>}
            </div>
          )}

          {/* Message thread */}
          <div className="flex flex-col gap-2 px-5 py-4 max-h-64 overflow-y-auto">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'max-w-[85%] rounded-2xl px-3 py-2 text-sm',
                  msg.isAdmin
                    ? 'self-end rounded-tr-none bg-accent text-primary'
                    : 'self-start rounded-tl-none bg-surface text-foreground',
                )}
              >
                {!msg.isAdmin && (
                  <p className="mb-0.5 text-[10px] font-bold text-muted">User</p>
                )}
                <p className="leading-snug whitespace-pre-wrap">{msg.body}</p>
                <p className={cn('mt-0.5 text-[10px]', msg.isAdmin ? 'text-primary/60' : 'text-muted')}>
                  {formatRelativeTime(msg.createdAt)}
                </p>
              </div>
            ))}
          </div>

          {/* Reply box */}
          <div className="flex items-end gap-2 border-t border-border px-5 py-3">
            <textarea
              placeholder="Reply to user…"
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void handleSend(); } }}
              rows={2}
              className="flex-1 resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <button
              type="button"
              onClick={() => void handleSend()}
              disabled={sending || !reply.trim()}
              className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent text-primary disabled:opacity-50"
            >
              {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            </button>
          </div>

          {/* Status actions */}
          <div className="flex flex-wrap gap-2 border-t border-border px-5 py-3">
            <span className="text-xs text-muted self-center">Change status:</span>
            {(['OPEN','IN_PROGRESS','RESOLVED','CLOSED'] as TicketStatus[])
              .filter((s) => s !== ticket.status)
              .map((s) => (
                <Button
                  key={s}
                  variant="outline"
                  size="sm"
                  disabled={updating}
                  onClick={() => void handleStatus(s)}
                  leftIcon={s === 'RESOLVED' ? <CheckCircle2 className="size-3" /> : undefined}
                >
                  {s.replace('_', ' ')}
                </Button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminSupportPage() {
  const { user } = useAppSelector((s) => s.auth);
  const isAdmin = user?.role === 'ADMIN';

  const [tickets,  setTickets]  = useState<SupportTicket[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState<TicketStatus | 'ALL'>('ALL');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await supportApi.adminListTickets(
        filter === 'ALL' ? undefined : filter,
      );
      setTickets(data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { void load(); }, [load]);

  const handleStatusChange = async (id: string, status: TicketStatus) => {
    await supportApi.updateStatus(id, status);
    setTickets((prev) =>
      prev.map((t) => t.id === id ? { ...t, status } : t),
    );
  };

  const counts = {
    ALL:         tickets.length,
    OPEN:        tickets.filter((t) => t.status === 'OPEN').length,
    IN_PROGRESS: tickets.filter((t) => t.status === 'IN_PROGRESS').length,
    RESOLVED:    tickets.filter((t) => t.status === 'RESOLVED').length,
    CLOSED:      tickets.filter((t) => t.status === 'CLOSED').length,
  };

  if (!isAdmin) {
    return (
      <DashboardShell>
        <DashboardEmptyState icon={Shield} title="Admin access required" description="" />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <DashboardHeader
        title="Support Inbox"
        description="Review and respond to user support tickets."
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

      {/* Stats strip */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: 'Open',        value: counts.OPEN,        color: 'text-amber-500'  },
          { label: 'In Progress', value: counts.IN_PROGRESS, color: 'text-blue-500'   },
          { label: 'Resolved',    value: counts.RESOLVED,    color: 'text-green-600'  },
          { label: 'Total',       value: counts.ALL,         color: 'text-foreground' },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3">
            <span className={cn('text-xl font-bold', s.color)}>{s.value}</span>
            <span className="text-sm text-muted">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-border pb-px">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={cn(
              '-mb-px shrink-0 border-b-2 px-4 py-2 text-sm font-medium transition-colors',
              filter === f.id
                ? 'border-accent text-foreground'
                : 'border-transparent text-muted hover:text-foreground',
            )}
          >
            {f.label}
            <span className="ml-1.5 text-xs font-normal text-muted">
              ({counts[f.id as keyof typeof counts] ?? 0})
            </span>
          </button>
        ))}
      </div>

      {/* Ticket list */}
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted">
          <Loader2 className="size-5 animate-spin" /> Loading tickets…
        </div>
      ) : tickets.length === 0 ? (
        <DashboardEmptyState
          icon={MessageCircle}
          title="No tickets"
          description="Support tickets submitted by users appear here."
        />
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => (
            <TicketCard
              key={t.id}
              ticket={t}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
