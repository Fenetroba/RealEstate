'use client';

import { useMemo, useState } from 'react';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';

import { DashboardEmptyState } from '@/components/dashboard/DashboardEmptyState';
import { DashboardFeedItem, DashboardFeedList } from '@/components/dashboard/DashboardFeedList';
import { DashboardFilterTabs } from '@/components/dashboard/DashboardFilterTabs';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardPanel } from '@/components/dashboard/DashboardPanel';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/Dialog';
import { mockNotifications } from '@/lib/mockData';
import { useAppDispatch } from '@/store/hooks';
import { addToast } from '@/store/slices/uiSlice';
import type { Notification } from '@/types';
import { typeBodySm, typeCaption } from '@/lib/responsive';
import { cn, formatRelativeTime } from '@/lib/utils';

const typeColors: Record<string, string> = {
  OFFER_RECEIVED: 'bg-primary/10 text-primary dark:text-foreground',
  OFFER_ACCEPTED: 'bg-success/10 text-success',
  OFFER_REJECTED: 'bg-destructive/10 text-destructive',
  TRANSACTION_COMPLETE: 'bg-success/10 text-success',
  PROPERTY_VERIFIED: 'bg-accent/10 text-accent',
  DAO_VOTE: 'bg-warning/10 text-warning',
  SYSTEM: 'bg-surface text-muted',
};

const feedFilters = [
  { id: 'ALL', label: 'All' },
  { id: 'UNREAD', label: 'Unread' },
  { id: 'OFFERS', label: 'Offers' },
  { id: 'SYSTEM', label: 'System' },
];

export default function NotificationsPage() {
  const dispatch = useAppDispatch();
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [feedFilter, setFeedFilter] = useState('ALL');
  const [deleteTarget, setDeleteTarget] = useState<Notification | null>(null);

  const unread = notifications.filter((n) => !n.isRead).length;

  const visibleNotifications = useMemo(
    () =>
      notifications.filter((n) => {
        if (feedFilter === 'UNREAD') return !n.isRead;
        if (feedFilter === 'OFFERS') return n.type.includes('OFFER');
        if (feedFilter === 'SYSTEM') return n.type === 'SYSTEM';
        return true;
      }),
    [notifications, feedFilter],
  );

  const handleMarkAllRead = () => {
    const count = notifications.filter((n) => !n.isRead).length;
    if (count === 0) {
      dispatch(
        addToast({
          type: 'info',
          title: 'Already up to date',
          message: 'You have no unread notifications.',
        }),
      );
      return;
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    dispatch(
      addToast({
        type: 'success',
        title: 'All marked read',
        message: `${count} notification${count === 1 ? '' : 's'} updated.`,
      }),
    );
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    setNotifications((prev) => prev.filter((n) => n.id !== deleteTarget.id));
    dispatch(
      addToast({
        type: 'info',
        title: 'Notification removed',
        message: deleteTarget.title,
      }),
    );
    setDeleteTarget(null);
  };

  return (
    <DashboardShell>
      <DashboardHeader
        title="Notifications"
        description={`${unread} unread notification${unread === 1 ? '' : 's'}`}
        actions={
          <Button
            variant="outline"
            size="sm"
            leftIcon={<CheckCheck className="size-4" />}
            onClick={handleMarkAllRead}
            disabled={unread === 0}
          >
            Mark all read
          </Button>
        }
      />

      <DashboardFilterTabs
        className="mb-6"
        options={feedFilters}
        value={feedFilter}
        onChange={setFeedFilter}
      />

      <DashboardPanel title="Activity feed" bodyClassName="p-0">
        {visibleNotifications.length === 0 ? (
          <DashboardEmptyState
            icon={Bell}
            title="No notifications"
            description="You're all caught up."
            className="border-0"
          />
        ) : (
          <DashboardFeedList>
            {visibleNotifications.map((notif) => (
              <DashboardFeedItem key={notif.id} unread={!notif.isRead} className="group">
                <div
                  className={cn(
                    'flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                    typeColors[notif.type] || typeColors.SYSTEM,
                  )}
                >
                  {notif.type.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-foreground">{notif.title}</p>
                    {!notif.isRead ? (
                      <span className="mt-1.5 size-2 shrink-0 rounded-full bg-accent" aria-hidden />
                    ) : null}
                  </div>
                  <p className={cn(typeBodySm, 'mt-0.5 line-clamp-2')}>{notif.message}</p>
                  <p className={cn(typeCaption, 'mt-1')}>{formatRelativeTime(notif.createdAt)}</p>
                </div>
                <button
                  type="button"
                  className="shrink-0 rounded-lg p-1 text-muted opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100 focus:opacity-100"
                  aria-label="Delete notification"
                  onClick={() => setDeleteTarget(notif)}
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
        description="This removes the item from your feed. You cannot undo this action."
        icon={Trash2}
        tone="danger"
        summary={
          deleteTarget
            ? [
                { label: 'Title', value: deleteTarget.title, highlight: true },
                { label: 'Type', value: deleteTarget.type },
              ]
            : undefined
        }
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={handleConfirmDelete}
      />
    </DashboardShell>
  );
}
