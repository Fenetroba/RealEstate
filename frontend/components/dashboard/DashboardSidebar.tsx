'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  Menu,
  X,
} from 'lucide-react';

import { DashboardNavIcon } from '@/components/dashboard/DashboardNavIcon';
import { SiteBrandLogo } from '@/components/layout/SiteBrandLogo';
import { DashboardThemeToggle } from '@/components/dashboard/DashboardThemeToggle';
import { Badge } from '@/components/ui/Badge';
import {
  dashboardAccountLinks,
  dashboardAdminNavGroups,
  dashboardAdminComingSoonLinks,
  dashboardHomeLink,
  dashboardSignOutIcon,
  dashboardUserNavGroups,
  type DashboardNavGroup,
  type DashboardNavLink,
} from '@/lib/constants/dashboard-nav';
import {
  dashboardMobileMenuButtonClass,
  dashboardNavGroupLabelClass,
  dashboardNavItemActiveClass,
  dashboardNavItemClass,
  dashboardNavItemIdleClass,
  dashboardOverlayClass,
  dashboardSidebarBaseClass,
  dashboardSidebarShellClass,
  dashboardSidebarCollapsedClass,
  dashboardSidebarDividerClass,
  dashboardSidebarExpandedClass,
  dashboardSidebarFlyoutClass,
  dashboardSidebarHeaderClass,
  dashboardSidebarNavGroupActiveClass,
  dashboardSidebarNavGroupIdleClass,
  dashboardSidebarNavItemActiveClass,
  dashboardSidebarNavItemIdleClass,
  dashboardSidebarNavSectionClass,
  dashboardSidebarNavStackClass,
  dashboardSidebarSignOutClass,
  dashboardSidebarThemeToggleClass,
  dashboardSidebarToggleClass,
} from '@/lib/constants/dashboard-layout';
import { cn } from '@/lib/utils';
import { selectIsAppAdmin } from '@/lib/auth-selectors';
import { selectIsGovWallet, selectWalletBadges } from '@/lib/wallet-selectors';
import { logoutUser } from '@/store/slices/authSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

const SIDEBAR_STORAGE_KEY = 'edenet-dashboard-sidebar';

function groupContainsPath(group: DashboardNavGroup, pathname: string) {
  return group.links.some((link) => pathname === link.href);
}

function buildInitialOpenState(groups: DashboardNavGroup[], pathname: string) {
  return Object.fromEntries(
    groups.map((group) => [group.id, groupContainsPath(group, pathname)]),
  );
}

function SidebarNavItem({
  link,
  pathname,
  onNavigate,
  collapsed,
  nested = false,
  inFlyout = false,
}: {
  link: DashboardNavLink;
  pathname: string;
  onNavigate: () => void;
  collapsed: boolean;
  nested?: boolean;
  inFlyout?: boolean;
}) {
  const isActive = pathname === link.href;
  const iconOnly = collapsed && !inFlyout;
  const activeClass = inFlyout ? dashboardNavItemActiveClass : dashboardSidebarNavItemActiveClass;
  const idleClass = inFlyout ? dashboardNavItemIdleClass : dashboardSidebarNavItemIdleClass;

  return (
    <Link
      href={link.href}
      onClick={onNavigate}
      title={iconOnly ? link.label : undefined}
      aria-label={iconOnly ? link.label : undefined}
      className={cn(
        dashboardNavItemClass,
        'relative',
        iconOnly ? 'justify-center px-0' : nested ? 'pl-6 pr-3' : 'px-2',
        isActive ? activeClass : idleClass,
      )}
    >
      <DashboardNavIcon
        icon={link.icon}
        isActive={isActive}
        inFlyout={inFlyout}
        compact={iconOnly}
      />
      {!iconOnly && (
        <>
          <span className="flex-1 truncate">{link.label}</span>
          {link.badge !== undefined && (
            <span className="flex size-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-primary">
              {link.badge}
            </span>
          )}
        </>
      )}
      {iconOnly && link.badge !== undefined && (
        <span className="absolute right-2 top-2 size-2 rounded-full bg-accent" aria-hidden />
      )}
    </Link>
  );
}

function SidebarNavGroup({
  group,
  pathname,
  isOpen,
  onToggle,
  onNavigate,
  collapsed,
}: {
  group: DashboardNavGroup;
  pathname: string;
  isOpen: boolean;
  onToggle: () => void;
  onNavigate: () => void;
  collapsed: boolean;
}) {
  const [flyoutOpen, setFlyoutOpen] = useState(false);
  const hasActive = groupContainsPath(group, pathname);

  if (collapsed) {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setFlyoutOpen((open) => !open)}
          title={group.label}
          aria-label={group.label}
          aria-expanded={flyoutOpen}
          className={cn(
            dashboardNavItemClass,
            'w-full justify-center px-0',
            hasActive ? dashboardSidebarNavItemActiveClass : dashboardSidebarNavItemIdleClass,
          )}
        >
          <DashboardNavIcon icon={group.icon} isActive={hasActive} compact />
        </button>

        {flyoutOpen && (
          <>
            <div
              className="fixed inset-0 z-40 hidden lg:block"
              onClick={() => setFlyoutOpen(false)}
              aria-hidden
            />
            <div className={cn(dashboardSidebarFlyoutClass, 'hidden lg:block')}>
              <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted">
                {group.label}
              </p>
              <div className={dashboardSidebarNavStackClass}>
                {group.links.map((link) => (
                  <SidebarNavItem
                    key={link.href}
                    link={link}
                    pathname={pathname}
                    onNavigate={() => {
                      onNavigate();
                      setFlyoutOpen(false);
                    }}
                    collapsed={collapsed}
                    inFlyout
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className={dashboardSidebarNavStackClass}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className={cn(
          dashboardNavGroupLabelClass,
          hasActive ? dashboardSidebarNavGroupActiveClass : dashboardSidebarNavGroupIdleClass,
        )}
      >
        <ChevronDown
          className={cn('size-4 shrink-0 transition-transform duration-200', isOpen && 'rotate-180')}
        />
        <span className="flex-1 truncate">{group.label}</span>
      </button>

      {isOpen && (
        <div className={dashboardSidebarNavStackClass}>
          {group.links.map((link) => (
            <SidebarNavItem
              key={link.href}
              link={link}
              pathname={pathname}
              onNavigate={onNavigate}
              collapsed={collapsed}
              nested
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function DashboardSidebar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const { user } = useAppSelector((s) => s.auth);
  const isAppAdmin = useAppSelector(selectIsAppAdmin);
  const walletBadges = useAppSelector(selectWalletBadges);
  const walletAddress = useAppSelector((s) => s.wallet.address);
  const isGovWallet = useAppSelector(selectIsGovWallet);
  const isWalletConnected = !!walletAddress;

  const sidebarCollapsed = collapsed && isDesktop;
  /** On mobile drawer, always show full logo + labels even if desktop sidebar was collapsed. */
  const showCollapsedSidebar = sidebarCollapsed && !mobileMenuOpen;

  const role = (user?.role || 'USER').toUpperCase();
  const sidebarLabel = isGovWallet
    ? 'Government'
    : isAppAdmin
      ? 'Admin'
      : isWalletConnected
        ? 'Citizen'
        : role;
  const navGroups = isAppAdmin ? dashboardAdminNavGroups : (isWalletConnected ? dashboardUserNavGroups : []);
  // eslint-disable-next-line react-hooks/exhaustive-deps

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    buildInitialOpenState(navGroups, pathname),
  );
  const [accountOpen, setAccountOpen] = useState(() =>
    dashboardAccountLinks.some((link) => pathname === link.href),
  );

  useEffect(() => {
    const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (saved === 'collapsed') {
      setCollapsed(true);
    }
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)');
    const update = () => setIsDesktop(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    setOpenGroups((prev) => {
      const next = { ...prev };
      navGroups.forEach((group) => {
        if (groupContainsPath(group, pathname)) {
          next[group.id] = true;
        }
      });
      return next;
    });

    if (dashboardAccountLinks.some((link) => pathname === link.href)) {
      setAccountOpen(true);
    }
  }, [pathname]);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  useEffect(() => {
    if (!isDesktop && mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
    document.body.style.overflow = '';
  }, [mobileMenuOpen, isDesktop]);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_STORAGE_KEY, next ? 'collapsed' : 'expanded');
      return next;
    });
  };

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const accountHasActive = dashboardAccountLinks.some((link) => pathname === link.href);

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className={dashboardMobileMenuButtonClass}
        aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
      >
        {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
      </button>

      {mobileMenuOpen && (
        <div
          className={dashboardOverlayClass}
          onClick={closeMobileMenu}
          aria-hidden
        />
      )}

      <div
        className={cn(
          dashboardSidebarShellClass,
          'overflow-visible transition-transform duration-300 ease-in-out',
          mobileMenuOpen
            ? 'translate-x-0'
            : '-translate-x-full max-lg:pointer-events-none lg:translate-x-0',
        )}
      >
        <button
          type="button"
          onClick={toggleCollapsed}
          className={dashboardSidebarToggleClass}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="size-4" />
          ) : (
            <ChevronLeft className="size-4" />
          )}
        </button>

        <aside
          className={cn(
            dashboardSidebarBaseClass,
            sidebarCollapsed ? dashboardSidebarCollapsedClass : dashboardSidebarExpandedClass,
          )}
          aria-hidden={!isDesktop && !mobileMenuOpen}
        >
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden">
        <div className={cn(dashboardSidebarHeaderClass, showCollapsedSidebar && 'px-2 pb-3.5 pt-3.5')}>
          {showCollapsedSidebar ? (
            <div className="flex flex-col items-center gap-2.5">
              <SiteBrandLogo
                href="/dashboard"
                imageClassName="size-8 rounded-full object-cover ring-1 ring-[var(--dashboard-sidebar-border)]"
                showText={false}
              />
              <Badge variant="gold" size="sm" className="w-fit self-start">
                {sidebarLabel}
              </Badge>
              <DashboardThemeToggle
                className={cn(dashboardSidebarThemeToggleClass, 'size-8')}
              />
            </div>
          ) : (
            <div className="pr-2">
              <div className="flex items-start justify-between gap-2 pe-1">
                <div className="flex min-w-0 flex-1 items-start gap-1.5 pe-2">
                  <SiteBrandLogo
                    href="/dashboard"
                    imageClassName="size-8 shrink-0 rounded-full object-cover ring-1 ring-[var(--dashboard-sidebar-border)]"
                    showText={false}
                  />
                  <div className="flex min-w-0 flex-col gap-2.5">
                    <Link
                      href="/dashboard"
                      className="truncate text-xs font-bold leading-tight text-[var(--dashboard-sidebar-fg)] dark:text-foreground"
                    >
                      EDENET<span className="text-accent"> Real Estate</span>
                    </Link>
                    <Badge variant="gold" size="sm" className="w-fit">
                      {sidebarLabel}
                    </Badge>
                  </div>
                </div>
                <DashboardThemeToggle
                  className={cn(dashboardSidebarThemeToggleClass, 'size-8')}
                />
              </div>
            </div>
          )}
        </div>

        <nav
          className={cn(
            'flex-1',
            dashboardSidebarNavSectionClass,
            showCollapsedSidebar ? 'p-2 pt-3.5' : 'p-3 pt-5',
          )}
        >
          {/* Home link at the top for all users */}
          <div className="mb-4">
            <SidebarNavItem
              link={dashboardHomeLink}
              pathname={pathname}
              onNavigate={closeMobileMenu}
              collapsed={showCollapsedSidebar}
            />
          </div>

          {/* Admin: grouped nav */}
          {isAppAdmin && navGroups.map((group) => (
            <SidebarNavGroup
              key={group.id}
              group={group}
              pathname={pathname}
              isOpen={openGroups[group.id] ?? false}
              onToggle={() => toggleGroup(group.id)}
              onNavigate={closeMobileMenu}
              collapsed={showCollapsedSidebar}
            />
          ))}

          {/* User: grouped nav */}
          {!isAppAdmin && navGroups.map((group) => (
            <SidebarNavGroup
              key={group.id}
              group={group}
              pathname={pathname}
              isOpen={openGroups[group.id] ?? false}
              onToggle={() => toggleGroup(group.id)}
              onNavigate={closeMobileMenu}
              collapsed={showCollapsedSidebar}
            />
          ))}
        </nav>

        <div className={cn('border-t', dashboardSidebarDividerClass, showCollapsedSidebar ? 'p-2' : 'p-3')}>
          <div className={dashboardSidebarNavStackClass}>
            {showCollapsedSidebar ? (
              <>
                {dashboardAccountLinks.map((link) => (
                  <SidebarNavItem
                    key={link.href}
                    link={link}
                    pathname={pathname}
                    onNavigate={closeMobileMenu}
                    collapsed={showCollapsedSidebar}
                  />
                ))}
                <button
                  type="button"
                  onClick={() => dispatch(logoutUser())}
                  title="Sign out"
                  aria-label="Sign out"
                  className={cn(
                    dashboardNavItemClass,
                    'w-full justify-center px-0',
                    dashboardSidebarSignOutClass,
                  )}
                >
                  <DashboardNavIcon icon={dashboardSignOutIcon} isActive={false} compact />
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setAccountOpen((open) => !open)}
                  aria-expanded={accountOpen}
                  className={cn(
                    dashboardNavGroupLabelClass,
                    accountHasActive
                      ? dashboardSidebarNavGroupActiveClass
                      : dashboardSidebarNavGroupIdleClass,
                  )}
                >
                  <ChevronDown
                    className={cn(
                      'size-4 shrink-0 transition-transform duration-200',
                      accountOpen && 'rotate-180',
                    )}
                  />
                  <span className="flex-1">Account</span>
                </button>

                {accountOpen && (
                  <div className="space-y-0.5">
                    {dashboardAccountLinks.map((link) => (
                      <SidebarNavItem
                        key={link.href}
                        link={link}
                        pathname={pathname}
                        onNavigate={closeMobileMenu}
                        collapsed={showCollapsedSidebar}
                        nested
                      />
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => dispatch(logoutUser())}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                    dashboardSidebarSignOutClass,
                  )}
                >
                  <DashboardNavIcon icon={dashboardSignOutIcon} isActive={false} />
                  Sign out
                </button>
              </>
            )}
          </div>
        </div>
        </div>
        </aside>
      </div>
    </>
  );
}
