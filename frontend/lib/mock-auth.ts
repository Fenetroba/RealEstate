import type { User } from '@/types';

import { isRegistryMockMode } from '@/lib/web3/registry-mock';

export const MOCK_AUTH_STORAGE_KEY = 'edenet-mock-auth-v1';

export const DEMO_USER_EMAIL = 'demo@edenet.et';
export const DEMO_ADMIN_EMAIL = 'admin@edenet.et';
export const DEMO_PASSWORD = 'Demo1234!';

const DEMO_TOKEN_PREFIX = 'mock-token-';

/**
 * Mock auth when explicitly enabled, or by default alongside registry mock demo.
 * Set NEXT_PUBLIC_USE_MOCK_AUTH=false to require a live API for login.
 */
export function isMockAuthMode(): boolean {
  const flag = process.env.NEXT_PUBLIC_USE_MOCK_AUTH;
  if (flag === 'false') return false;
  if (flag === 'true') return true;
  return isRegistryMockMode();
}

function nowIso(): string {
  return new Date().toISOString();
}

function buildUser(partial: {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: User['role'];
}): User {
  const t = nowIso();
  return {
    ...partial,
    isVerified: true,
    isEmailVerified: true,
    createdAt: t,
    updatedAt: t,
  };
}

const DEMO_USER = buildUser({
  id: 'mock-user-demo',
  email: DEMO_USER_EMAIL,
  first_name: 'Demo',
  last_name: 'User',
  role: 'USER',
});

const DEMO_ADMIN = buildUser({
  id: 'mock-user-admin',
  email: DEMO_ADMIN_EMAIL,
  first_name: 'Platform',
  last_name: 'Admin',
  role: 'ADMIN',
});

export interface MockAuthSession {
  user: User;
  accessToken: string;
}

export function readMockAuthSession(): MockAuthSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(MOCK_AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MockAuthSession;
    if (!parsed?.user?.email || !parsed.accessToken) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeMockAuthSession(session: MockAuthSession): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MOCK_AUTH_STORAGE_KEY, JSON.stringify(session));
  localStorage.setItem('accessToken', session.accessToken);
}

export function clearMockAuthSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(MOCK_AUTH_STORAGE_KEY);
  localStorage.removeItem('accessToken');
}

function sessionFor(user: User): MockAuthSession {
  return {
    user,
    accessToken: `${DEMO_TOKEN_PREFIX}${user.id}`,
  };
}

export function tryMockLogin(
  email: string,
  password: string,
): MockAuthSession | { error: string } {
  const normalized = email.trim().toLowerCase();
  if (password !== DEMO_PASSWORD) {
    return { error: 'Invalid email or password' };
  }
  if (normalized === DEMO_USER_EMAIL) {
    return sessionFor(DEMO_USER);
  }
  if (normalized === DEMO_ADMIN_EMAIL) {
    return sessionFor(DEMO_ADMIN);
  }
  const stored = readMockAuthSession();
  if (stored && stored.user.email.toLowerCase() === normalized) {
    return stored;
  }
  return { error: 'Invalid email or password' };
}

export function mockRegister(data: {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: string;
}): MockAuthSession | { error: string } {
  if (data.password.length < 8) {
    return { error: 'Password must be at least 8 characters' };
  }
  const email = data.email.trim().toLowerCase();
  if (email === DEMO_USER_EMAIL || email === DEMO_ADMIN_EMAIL) {
    return { error: 'This email is reserved for demo accounts. Use a different email.' };
  }
  const user = buildUser({
    id: `mock-user-${Date.now()}`,
    email: data.email.trim(),
    first_name: data.first_name.trim(),
    last_name: data.last_name.trim(),
    role: data.role === 'ADMIN' ? 'ADMIN' : 'USER',
  });
  const session = sessionFor(user);
  writeMockAuthSession(session);
  return session;
}

export function mockAuthDemoHint(): string {
  return `Demo: ${DEMO_USER_EMAIL} or ${DEMO_ADMIN_EMAIL} · password ${DEMO_PASSWORD}`;
}
