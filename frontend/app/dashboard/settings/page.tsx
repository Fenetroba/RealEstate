'use client';

import { useState } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { dashboardTabActiveClass, dashboardTabIdleClass } from '@/lib/constants/dashboard-layout';
import { cn } from '@/lib/utils';
import {
  Settings, Bell, Lock, Shield, Eye, EyeOff,
  Moon, Sun, Smartphone, Mail, MessageSquare,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { changePasswordSchema } from '@/lib/validation/password-change-schema';
import { zodFieldErrors } from '@/lib/validation/zod-utils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addToast } from '@/store/slices/uiSlice';
import { setTheme } from '@/store/slices/uiSlice';

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.ui.theme);
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'notifications' | 'privacy'>('general');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  const [settings, setSettings] = useState({
    language: 'en',
    timezone: 'America/Los_Angeles',
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    propertyUpdates: true,
    priceAlerts: true,
    offerNotifications: true,
    daoVoting: true,
    maintenanceUpdates: true,
    paymentReminders: true,
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    showWallet: true,
    twoFactorAuth: false,
    loginAlerts: true,
  });

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
  ];

  const handleSave = () => {
    // TODO: Implement API call to save settings
    dispatch(
      addToast({
        type: 'success',
        title: 'Settings saved',
        message: 'Preferences updated locally until the settings API is connected.',
      }),
    );
  };

  const handlePasswordUpdate = () => {
    const result = changePasswordSchema.safeParse(passwordForm);
    if (!result.success) {
      setPasswordErrors(zodFieldErrors(result.error));
      dispatch(
        addToast({
          type: 'error',
          title: 'Check password fields',
          message: result.error.issues[0]?.message ?? 'Please fix the highlighted fields.',
        }),
      );
      return;
    }
    setPasswordErrors({});
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    dispatch(
      addToast({
        type: 'success',
        title: 'Password validated',
        message: 'Password change will apply when the security API is connected.',
      }),
    );
  };

  return (
    <DashboardShell>
      <DashboardHeader
        title="Settings"
        description="Manage your account settings and preferences"
      />

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar Tabs */}
          <div className="lg:col-span-1">
            <Card className="p-2">
              <div className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                      activeTab === tab.id ? dashboardTabActiveClass : dashboardTabIdleClass,
                    )}
                  >
                    <tab.icon className="h-5 w-5" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>General Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    
                    <Select
                      label="Timezone"
                      options={[
                        { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
                        { value: 'America/New_York', label: 'Eastern Time (ET)' },
                        { value: 'America/Chicago', label: 'Central Time (CT)' },
                        { value: 'Europe/London', label: 'London (GMT)' },
                        { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
                      ]}
                      value={settings.timezone}
                      onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                    />
                
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-3">
                        Theme
                      </label>
                      <div className="flex gap-3">
                        <button
                          onClick={() => dispatch(setTheme('light'))}
                          className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                            theme === 'light'
                              ? 'border-accent bg-accent/5'
                              : 'border-border hover:border-muted'
                          }`}
                        >
                          <Sun className="h-6 w-6 mx-auto mb-2 text-accent" />
                          <p className="text-sm font-medium text-foreground">Light</p>
                        </button>
                        <button
                          onClick={() => dispatch(setTheme('dark'))}
                          className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                            theme === 'dark'
                              ? 'border-accent bg-accent/5'
                              : 'border-border hover:border-muted'
                          }`}
                        >
                          <Moon className="h-6 w-6 mx-auto mb-2 text-primary dark:text-accent" />
                          <p className="text-sm font-medium text-foreground">Dark</p>
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Input
                      label="Current Password"
                      type={showCurrentPassword ? 'text' : 'password'}
                      placeholder="Enter current password"
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))
                      }
                      error={passwordErrors.currentPassword}
                      leftIcon={<Lock className="h-4 w-4" />}
                      rightIcon={
                        <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                          {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      }
                    />
                    <Input
                      label="New Password"
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="Enter new password"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))
                      }
                      error={passwordErrors.newPassword}
                      leftIcon={<Lock className="h-4 w-4" />}
                      rightIcon={
                        <button type="button" onClick={() => setShowNewPassword(!showNewPassword)}>
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      }
                    />
                    <Input
                      label="Confirm New Password"
                      type="password"
                      placeholder="Confirm new password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))
                      }
                      error={passwordErrors.confirmPassword}
                      leftIcon={<Lock className="h-4 w-4" />}
                    />
                    <Button variant="primary" className="w-full" onClick={handlePasswordUpdate}>
                      Update Password
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Two-Factor Authentication</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-surface">
                      <div className="flex items-center gap-3">
                        <Smartphone className="h-5 w-5 text-muted" />
                        <div>
                          <p className="font-medium text-foreground">2FA Status</p>
                          <p className="text-sm text-muted">
                            {settings.twoFactorAuth ? 'Enabled' : 'Disabled'}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant={settings.twoFactorAuth ? 'outline' : 'primary'}
                        size="sm"
                        onClick={() => setSettings({ ...settings, twoFactorAuth: !settings.twoFactorAuth })}
                      >
                        {settings.twoFactorAuth ? 'Disable' : 'Enable'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

              </div>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Channels</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { key: 'emailNotifications', label: 'Email Notifications', icon: Mail },
                      { key: 'pushNotifications', label: 'Push Notifications', icon: Bell },
                      { key: 'smsNotifications', label: 'SMS Notifications', icon: MessageSquare },
                     
                    ].map((item) => (
                      <label
                        key={item.key}
                        className="flex items-center justify-between p-4 rounded-xl bg-surface cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="h-5 w-5 text-muted" />
                          <p className="font-medium text-foreground">{item.label}</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings[item.key as keyof typeof settings] as boolean}
                          onChange={(e) => setSettings({ ...settings, [item.key]: e.target.checked })}
                          className="w-5 h-5 rounded border-border text-accent focus:ring-accent"
                        />
                      </label>
                    ))}
                  </CardContent>
                </Card>

              </div>
            )}

            {/* Privacy Settings */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
             

              </div>
            )}

        
          </div>
        </div>
    </DashboardShell>
  );
}
