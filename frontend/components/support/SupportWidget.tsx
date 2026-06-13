'use client';

import { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle, CheckCircle2, ChevronDown,
  Loader2, MessageCircle, Send, X,
} from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { supportApi, type SupportTicket } from '@/lib/api/support';
import { cn, formatRelativeTime } from '@/lib/utils';

// ── Step types ────────────────────────────────────────────────────────────────
type Step = 'closed' | 'form' | 'thread';

// ── Helpers ───────────────────────────────────────────────────────────────────
function statusColor(s: string) {
  if (s === 'OPEN')        return 'bg-amber-500';
  if (s === 'IN_PROGRESS') return 'bg-blue-500';
  if (s === 'RESOLVED')    return 'bg-green-500';
  return 'bg-muted';
}
function statusLabel(s: string) {
  if (s === 'OPEN')        return 'Open';
  if (s === 'IN_PROGRESS') return 'In Progress';
  if (s === 'RESOLVED')    return 'Resolved';
  return 'Closed';
}

// ── Main widget ───────────────────────────────────────────────────────────────
export function SupportWidget() {
  const { user, isAuthenticated } = useAppSelector((s) => s.auth);

  const [step,         setStep]         = useState<Step>('closed');
  const [submitting,   setSubmitting]   = useState(false);
  const [sending,      setSending]      = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const [success,      setSuccess]      = useState(false);
  const [ticket,       setTicket]       = useState<SupportTicket | null>(null);

  // New ticket form
  const [subject,      setSubject]      = useState('');
  const [body,         setBody]         = useState('');
  const [guestEmail,   setGuestEmail]   = useState('');
  const [guestName,    setGuestName]    = useState('');

  // Thread reply
  const [reply,        setReply]        = useState('');
  const threadRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of thread on new messages
  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [ticket?.messages]);

  const handleOpen = () => {
    setStep('form');
    setError(null);
    setSuccess(false);
  };

  const handleClose = () => {
    setStep('closed');
    setError(null);
  };

  const handleSubmit = async () => {
    if (!subject.trim() || !body.trim()) {
      setError('Subject and message are required.');
      return;
    }
    if (!isAuthenticated && !guestEmail.trim()) {
      setError('Email is required.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const created = await supportApi.createTicket({
        subject,
        body,
        guestEmail: isAuthenticated ? undefined : guestEmail,
        guestName:  isAuthenticated ? undefined : guestName,
      });
      setTicket(created);
      setSuccess(true);
      setStep('thread');
      // Reset form
      setSubject('');
      setBody('');
      setGuestEmail('');
      setGuestName('');
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Could not submit ticket. Try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendReply = async () => {
    if (!reply.trim() || !ticket) return;
    setSending(true);
    try {
      const msg = await supportApi.addMessage(ticket.id, reply);
      setTicket((prev) => prev ? { ...prev, messages: [...prev.messages, msg] } : prev);
      setReply('');
    } catch {
      /* silent */
    } finally {
      setSending(false);
    }
  };

  // ── Floating button ──────────────────────────────────────────────────────

  if (step === 'closed') {
    return (
      <button
        type="button"
        onClick={handleOpen}
        aria-label="Open support chat"
        className={cn(
          'fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center',
          'rounded-full bg-accent text-primary shadow-lg transition-transform',
          'hover:scale-110 focus:outline-none focus:ring-4 focus:ring-accent/40',
        )}
      >
        <MessageCircle className="size-6" />
      </button>
    );
  }

  // ── Panel ────────────────────────────────────────────────────────────────

  return (
    <div
      className={cn(
        'fixed bottom-6 right-6 z-50 flex w-[360px] max-w-[calc(100vw-2rem)] flex-col',
        'overflow-hidden rounded-2xl border border-border bg-card shadow-2xl',
      )}
      style={{ maxHeight: '80vh' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between bg-accent px-4 py-3">
        <div className="flex items-center gap-2">
          <MessageCircle className="size-5 text-primary" />
          <span className="font-semibold text-primary text-sm">Support</span>
          {ticket && (
            <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold text-white', statusColor(ticket.status))}>
              {statusLabel(ticket.status)}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handleClose}
          className="rounded-lg p-1 text-primary/70 hover:text-primary transition-colors"
          aria-label="Close"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* ── Form step ── */}
      {step === 'form' && (
        <div className="flex flex-col gap-3 overflow-y-auto p-4">
          <p className="text-xs text-muted">
            {isAuthenticated
              ? `Hi ${user?.first_name ?? 'there'} 👋 How can we help?`
              : 'Fill in your details and we\'ll get back to you.'}
          </p>

          {!isAuthenticated && (
            <div className="grid grid-cols-2 gap-2">
              <input
                placeholder="Your name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <input
                type="email"
                placeholder="Email *"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          )}

          <input
            placeholder="Subject *"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
          />

          <textarea
            placeholder="Describe your issue or question…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            className="resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
          />

          {error && (
            <p className="flex items-center gap-1.5 text-xs text-destructive">
              <AlertTriangle className="size-3.5 shrink-0" /> {error}
            </p>
          )}

          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={submitting}
            className="flex items-center justify-center gap-2 rounded-xl bg-accent py-2.5 text-sm font-semibold text-primary transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {submitting
              ? <><Loader2 className="size-4 animate-spin" /> Sending…</>
              : <><Send className="size-4" /> Send message</>}
          </button>
        </div>
      )}

      {/* ── Thread step ── */}
      {step === 'thread' && ticket && (
        <>
          {/* Success banner */}
          {success && (
            <div className="flex items-center gap-2 bg-green-50 px-4 py-2 text-xs text-green-700 dark:bg-green-950 dark:text-green-300">
              <CheckCircle2 className="size-4 shrink-0" />
              Ticket #{ticket.id.slice(0, 8)} created. We'll respond soon!
            </div>
          )}

          {/* Subject */}
          <div className="border-b border-border px-4 py-2">
            <p className="text-xs font-semibold text-foreground truncate">{ticket.subject}</p>
          </div>

          {/* Messages */}
          <div
            ref={threadRef}
            className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-3"
            style={{ minHeight: 120 }}
          >
            {ticket.messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'max-w-[85%] rounded-2xl px-3 py-2 text-sm',
                  msg.isAdmin
                    ? 'self-start rounded-tl-none bg-surface text-foreground'
                    : 'self-end rounded-tr-none bg-accent text-primary',
                )}
              >
                {msg.isAdmin && (
                  <p className="mb-0.5 text-[10px] font-bold text-muted">Support Team</p>
                )}
                <p className="leading-snug">{msg.body}</p>
                <p className={cn('mt-0.5 text-[10px]', msg.isAdmin ? 'text-muted' : 'text-primary/60')}>
                  {formatRelativeTime(msg.createdAt)}
                </p>
              </div>
            ))}
          </div>

          {/* Reply input */}
          {ticket.status !== 'CLOSED' && ticket.status !== 'RESOLVED' && (
            <div className="flex items-end gap-2 border-t border-border p-3">
              <textarea
                placeholder="Reply…"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void handleSendReply();
                  }
                }}
                rows={2}
                className="flex-1 resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <button
                type="button"
                onClick={() => void handleSendReply()}
                disabled={sending || !reply.trim()}
                className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent text-primary transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              </button>
            </div>
          )}

          {(ticket.status === 'CLOSED' || ticket.status === 'RESOLVED') && (
            <div className="border-t border-border px-4 py-3 text-center text-xs text-muted">
              This ticket is {ticket.status.toLowerCase()}.{' '}
              <button
                type="button"
                onClick={() => { setTicket(null); setSuccess(false); setStep('form'); }}
                className="text-accent hover:underline"
              >
                Open a new one
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
