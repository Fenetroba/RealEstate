import {
  Activity,
  BarChart3,
  Bookmark,
  CircleUser,
  ClipboardCheck,
  ClipboardList,
  FilePlus,
  Compass,
  Building2,
  Home,
  House,
  Receipt,
  LogOut,
  ShieldCheck,
  SlidersHorizontal,
  UsersRound,
  type LucideIcon,
} from 'lucide-react';

export interface DashboardNavLink {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

export interface DashboardNavGroup {
  id: string;
  label: string;
  icon: LucideIcon;
  links: DashboardNavLink[];
}

export const dashboardHomeLink: DashboardNavLink = {
  href: '/',
  label: 'Home',
  icon: Home,
};

// ── User nav groups ───────────────────────────────────────────────────────────

export const dashboardUserNavGroups: DashboardNavGroup[] = [
  {
    id: 'my-property',
    label: 'Portfolio',
    icon: House,
    links: [
      { href: '/properties',              label: 'View marketplace',    icon: Compass      },
      { href: '/dashboard/saved',         label: 'Saved listings',      icon: Bookmark     },
      { href: '/dashboard/my-properties', label: 'My properties',       icon: Building2    },
      { href: '/dashboard/listings/create', label: 'Submit registration', icon: FilePlus   },
    ],
  },
  {
    id: 'activity',
    label: 'Activity',
    icon: Activity,
    links: [
      { href: '/dashboard/my-requests',   label: 'My requests',         icon: ClipboardList },
      { href: '/dashboard/transactions',  label: 'On-chain activity',   icon: Receipt       },
      { href: '/dashboard/analytics',     label: 'My analytics',        icon: BarChart3     },
    ],
  },
];

// ── Admin nav groups ──────────────────────────────────────────────────────────

export const dashboardAdminNavGroups: DashboardNavGroup[] = [
  {
    id: 'admin-tools',
    label: 'Admin tools',
    icon: ClipboardCheck,
    links: [
      { href: '/dashboard/property-approvals', label: 'Property approvals', icon: ClipboardCheck },
      { href: '/dashboard/users',              label: 'Users & KYC review',  icon: UsersRound     },
      { href: '/dashboard/admin-analytics',    label: 'Analytics',           icon: BarChart3      },
    ],
  },
];

// Keep flat list for backward compat (sidebar still uses this for non-grouped rendering)
export const dashboardAdminNavLinks: DashboardNavLink[] = [
  { href: '/dashboard/property-approvals', label: 'Property approvals', icon: ClipboardCheck },
  { href: '/dashboard/users',              label: 'Users & KYC review',  icon: UsersRound     },
  { href: '/properties',                   label: 'View marketplace',    icon: Compass        },
  { href: '/dashboard/my-properties',      label: 'My properties',       icon: Building2      },
  { href: '/dashboard/my-requests',        label: 'My requests',         icon: ClipboardList  },
  { href: '/dashboard/listings/create',    label: 'Submit registration', icon: FilePlus       },
];

export const dashboardAdminComingSoonLinks: DashboardNavLink[] = [];

// ── Account + shared ──────────────────────────────────────────────────────────

export const dashboardAccountLinks: DashboardNavLink[] = [
  { href: '/dashboard/profile',      label: 'Profile',  icon: CircleUser      },
  { href: '/dashboard/settings',     label: 'Settings', icon: SlidersHorizontal },
  { href: '/dashboard/verification', label: 'KYC',      icon: ShieldCheck     },
];

export const dashboardSignOutIcon = LogOut;
