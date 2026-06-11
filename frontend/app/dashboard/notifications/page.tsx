'use client';

import { useEffect, useMemo, useState } from 'react';
import { Bell, CheckCheck, Loader2, RefreshCw, Trash2 } from 'lucide-react';

import { DashboardEmptyState } from '@/components/dashboard/DashboardEmptyState';
import { DashboardFeedItem, DashboardFeedList } from '@/components/dashboard/DashboardFeedList';
import { DashboardFilterTabs } from '@/components/dashboard/DashboardFilterTabs';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardPanel } from '@/components/dashboard/DashboardPanel';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/Dialog';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchNotifications,
  markAllAsRead,
  markAsRead,
} from '@/store/slices/notificationSlice';
import { notificationApi } from '@/lib/api/notification';
import { addToast } from '@/store/slices/uiSlice';
import type { Notification } from '@/types';
import { typeBodySm, typeCaption } from '@/lib/responsive';
import { cn, formatRelativeTime } from '@/lib/utils';

// ── Color coding per notification type ───────────────────────────────────────
const typeColors: Record<string, string> = {
  REQUEST_APPROVED:    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  REQUEST_DECLINED:    'bg-destructive/10 text-destructive',
  KYC_APPROVED:        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  KYC_REJECTED:        'bg-destructive/10 text-destructive',
  PROPERTY_VERIFIED:   'bg-accent/10 text-accent',
  OFFER_RECEIVED:      'bg-primary/10 text-primary dark:text-foreground',
  OFFER_ACCEPTED:      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  OFFER_REJECTED:      'bg-destructive/10 text-destructive',
  TRANSACTION_COMPLETE:'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  DAO_VOTE:            'bg-warning/10 text-warning',
  SYSTEM:              'bg-surface text-muted',
};

const typeLabel: Record<string, string> = {
  REQUEST_APPROVED:    '✓',
  REQUEST_DECLINED:    '✗',
  KYC_APPROVED:        '✓',
  KYC_REJECTED:        '✗',
  PROPERTY_VERIFIED:   '✓',
  OFFER_RECEIVED:      'O',
  OFFER_ACCEPTED:      '✓',
  OFFER_REJECTED:      '✗',
  TRANSACTION_COMPLETE:'$',
  DAO_VOTE:            'V',
  SYSTEM:              'i',
};

const feedFilters = [
  { id: 'ALL',    label: 'All' },
  { id: 'UNREAD', label: 'Unread' },
  { id: 'SYSTEM', label: 'System' },
];

export default function NotificationsPage() {
  const dispatch = useAppDispatch();
  const { notifications, isLoading, unreadCount } = useAppSelector((s) => s.notification);
  const [feedFilter, setFeedFilter] = useState('ALL');
  const [deleteTarget, setDeleteTarget] = useState<Notification | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    void dispatch(fetchNotifications());
  }, [dispatch]);

  const visible = useMemo(
    () =>
      notifications.filter((n) => {
        if (feedFilter === 'UNREAD') return !n.isRead;
        if (feedFilter === 'SYSTEM') return n.type === 'SYSTEM';
        return true;
      }),
    [notifications, feedFilter],
  );

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) {
      dispatch(addToast({ type: 'info', title: 'Already up to date', message: 'No unread notifications.' }));
      return;
    }
    await dispatch(markAllAsRead());
    dispatch(addToast({ type: 'success', title: 'All marked read' }));
  };

  const handleMarkOne = async (n: Notification) => {
    if (n.isRead) return;
    await dispatch(markAsRead(n.id));
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await notificationApi.delete(deleteTarget.id);
      dispatch(addToast({ type: 'info', title: 'Notification removed', message: deleteTarget.title }));
      // Re-fetch to sync
      await dispatch(fetchNotifications());
    } catch {
      dispatch(addToast({ type: 'error', title: 'Could not delete notification' }));
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <DashboardShell>
      <DashboardHeader
        title="Notifications"
        description={`${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={isLoading ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
              onClick={() => void dispatch(fetchNotifications())}
              disabled={isLoading}
            >
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<CheckCheck className="size-4" />}
              onClick={() => void handleMarkAllRead()}
              disabled={unreadCount === 0 || isLoading}
            >
              Mark all read
            </Button>
          </div>
        }
      />

      <DashboardFilterTabs
        className="mb-6"
        options={feedFilters}
        value={feedFilter}
        onChange={setFeedFilter}
      />

      <DashboardPanel title="Activity feed" bodyClassName="p-0">
        {isLoading && notifications.length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted">
            <Loader2 className="size-5 animate-spin" />
            Loading…
          </div>
        ) : visible.length === 0 ? (
          <DashboardEmptyState
            icon={Bell}
            title="No notifications"
            description="You're all caught up."
            className="border-0"
          />
        ) : (
          <DashboardFeedList>
            {visible.map((notif) => (
              <DashboardFeedItem
                key={notif.id}
                unread={!notif.isRead}
                className="group cursor-pointer"
                onClick={() => void handleMarkOne(notif)}
              >
                {/* Icon badge */}
                <div
                  className={cn(
                    'flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                    typeColors[notif.type] ?? typeColors.SYSTEM,
                  )}
                >
                  {typeLabel[notif.type] ?? '•'}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-foreground leading-snug">{notif.title}</p>
                    {!notif.isRead && (
                      <span className="mt-1.5 size-2 shrink-0 rounded-full bg-accent" aria-hidden />
                    )}
                  </div>
                  <p className={cn(typeBodySm, 'mt-0.5 line-clamp-2 text-muted')}>{notif.message}</p>
                  <p className={cn(typeCaption, 'mt-1 text-muted')}>
                    {formatRelativeTime(notif.createdAt)}
                  </p>
                  {notif.link && (
                    <a
                      href={notif.link}
                      className="mt-1 inline-block text-xs text-accent hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View →
                    </a>
                  )}
                </div>

                {/* Delete button */}
                <button
                  type="button"
                  className="shrink-0 rounded-lg p-1.5 text-muted opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100 focus:opacity-100"
                  aria-label="Delete notification"
                  onClick={(e) => { e.stopPropagation(); setDeleteTarget(notif); }}
                >
                  <Trash2 className="size-4" />
                </button>
              </DashboardFeedItem>
            ))}
          </DashboardFeedList>
        )}
      </DashboardPanel>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete notification?"
        description="This removes the item from your feed permanently."
        icon={Trash2}
        tone="danger"
        summary={
          deleteTarget
            ? [
                { label: 'Title', value: deleteTarget.title, highlight: true },
                { label: 'Type',  value: deleteTarget.type },
              ]
            : undefined
        }
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={() => void handleConfirmDelete()}
        isLoading={deleting}
      />
    </DashboardShell>
  );
}
