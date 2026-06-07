'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Calendar,
  CheckCircle,
  ExternalLink,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Shield,
  User,
} from 'lucide-react';

import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { dashboardCardClass, dashboardPanelClass } from '@/lib/constants/dashboard-layout';
import { enableAdminPreview, disableAdminPreview } from '@/lib/admin-preview-actions';
import { selectIsAppAdmin } from '@/lib/auth-selectors';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useWeb3 } from '@/contexts/Web3Context';
import { addToast } from '@/store/slices/uiSlice';
import { updateProfileUser } from '@/store/slices/authSlice';
import { cn, getInitials, truncateAddress } from '@/lib/utils';

interface ProfileForm {
  first_name: string;
  last_name: string;
  phone: string;
  location: string;
}

export default function DashboardProfilePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { connect } = useWeb3();
  const { user, isLoading } = useAppSelector((s) => s.auth);
  const isAppAdmin = useAppSelector(selectIsAppAdmin);
  const { address, isConnected } = useAppSelector((s) => s.wallet);

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<ProfileForm>({
    first_name: '',
    last_name: '',
    phone: '',
    location: '',
  });

  // Sync form whenever user changes (after save or on mount)
  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name ?? '',
        last_name:  user.last_name  ?? '',
        phone:      user.phone      ?? '',
        location:   user.location   ?? '',
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!form.first_name.trim() || !form.last_name.trim()) {
      dispatch(addToast({ type: 'error', title: 'First and last name are required.' }));
      return;
    }

    const result = await dispatch(
      updateProfileUser({
        first_name: form.first_name.trim(),
        last_name:  form.last_name.trim(),
        phone:      form.phone.trim()    || undefined,
        location:   form.location.trim() || undefined,
      }),
    );

    if (updateProfileUser.fulfilled.match(result)) {
      dispatch(addToast({ type: 'success', title: 'Profile updated', message: 'Your changes have been saved.' }));
      setIsEditing(false);
    } else {
      dispatch(addToast({
        type: 'error',
        title: 'Update failed',
        message: (result.payload as string) ?? 'Something went wrong.',
      }));
    }
  };

  const handleCancel = () => {
    if (user) {
      setForm({
        first_name: user.first_name ?? '',
        last_name:  user.last_name  ?? '',
        phone:      user.phone      ?? '',
        location:   user.location   ?? '',
      });
    }
    setIsEditing(false);
  };

  const field = (key: keyof ProfileForm) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value })),
    disabled: !isEditing,
  });

  return (
    <DashboardShell>
      <DashboardHeader
        title="Profile"
        description="Manage your personal information and account details."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link href="/dashboard/settings">
              <Button variant="outline" size="sm">Settings</Button>
            </Link>
            <Link href="/dashboard/verification">
              <Button variant="outline" size="sm">KYC</Button>
            </Link>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">

        {/* ── Left card ─────────────────────────────────────────────────── */}
        <div className={cn(dashboardCardClass, 'p-6 lg:col-span-1')}>
          <div className="text-center">
            {/* Avatar */}
            <div className="mx-auto mb-4 flex size-24 items-center justify-center rounded-2xl gradient-gold text-2xl font-bold text-white">
              {getInitials(form.first_name || 'U', form.last_name || 'S')}
            </div>

            <h2 className="font-heading text-lg font-semibold text-foreground">
              {form.first_name || 'User'} {form.last_name}
            </h2>
            <p className="mt-0.5 text-sm text-muted">{user?.email}</p>

            <Badge variant="gold" className="mt-2">
              {(user?.role ?? 'USER').toUpperCase()}
            </Badge>

            {user?.isVerified ? (
              <p className="mt-3 flex items-center justify-center gap-1.5 text-sm text-success">
                <CheckCircle className="size-4" aria-hidden />
                Verified account
              </p>
            ) : (
              <Link
                href="/dashboard/verification"
                className="mt-3 inline-block text-sm font-medium text-accent hover:underline"
              >
                Complete KYC →
              </Link>
            )}

            {/* Admin preview toggle */}
            <div className="mt-6">
              {!isAppAdmin ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    enableAdminPreview(dispatch);
                    router.push('/dashboard/property-approvals');
                  }}
                >
                  Open admin preview
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    disableAdminPreview(dispatch);
                    router.push('/dashboard');
                  }}
                >
                  Exit admin preview
                </Button>
              )}
            </div>

            {/* Wallet */}
            <div className="mt-6 rounded-xl border border-border bg-surface p-4 text-left">
              <p className="text-xs font-medium text-muted">Connected wallet</p>
              {isConnected && address ? (
                <p className="mt-1 font-mono text-sm text-foreground break-all">
                  {truncateAddress(address)}
                </p>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  className="mt-3 w-full"
                  onClick={() => void connect()}
                >
                  Connect Wallet
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* ── Right panel ───────────────────────────────────────────────── */}
        <div className={cn(dashboardPanelClass, 'lg:col-span-2')}>

          {/* Header row */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-heading text-base font-semibold text-foreground">
              Personal information
            </h3>
            {!isEditing ? (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCancel} disabled={isLoading}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => void handleSave()}
                  disabled={isLoading}
                  leftIcon={isLoading ? <Loader2 className="size-4 animate-spin" /> : undefined}
                >
                  {isLoading ? 'Saving…' : 'Save changes'}
                </Button>
              </div>
            )}
          </div>

          {/* Form fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="First name"
              placeholder="John"
              leftIcon={<User className="size-4" />}
              {...field('first_name')}
            />
            <Input
              label="Last name"
              placeholder="Doe"
              {...field('last_name')}
            />
            <Input
              label="Email"
              type="email"
              value={user?.email ?? ''}
              disabled
              leftIcon={<Mail className="size-4" />}
              hint="Email cannot be changed here"
              containerClassName="sm:col-span-2"
            />
            <Input
              label="Phone"
              placeholder="+1 555 000 0000"
              leftIcon={<Phone className="size-4" />}
              {...field('phone')}
            />
            <Input
              label="Location"
              placeholder="City, Country"
              leftIcon={<MapPin className="size-4" />}
              {...field('location')}
            />
          </div>

          {/* Read-only info section */}
          <div className="mt-6 space-y-3 border-t border-border pt-6">
            <div className="flex items-start gap-3 rounded-xl bg-surface p-4">
              <Calendar className="mt-0.5 size-5 shrink-0 text-muted" aria-hidden />
              <div>
                <p className="text-sm font-medium text-foreground">Member since</p>
                <p className="text-sm text-muted">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString(undefined, {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : '—'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl bg-surface p-4">
              <Shield className="mt-0.5 size-5 shrink-0 text-muted" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">Identity (KYC)</p>
                <p className="text-sm text-muted">
                  Upload your ID and a selfie. An admin will review and approve or decline.
                </p>
              </div>
              <Link href="/dashboard/verification">
                <Button
                  variant="outline"
                  size="sm"
                  rightIcon={<ExternalLink className="size-3.5" />}
                >
                  Open KYC
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
