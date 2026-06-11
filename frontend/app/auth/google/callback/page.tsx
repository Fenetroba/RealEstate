'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAppDispatch } from '@/store/hooks';
import { setGoogleAuthUser } from '@/store/slices/authSlice';
import { addToast } from '@/store/slices/uiSlice';

/**
 * /auth/google/callback
 * Landing page after Google OAuth redirect.
 * Backend sends: ?token=<accessToken>&user=<encodedJSON>
 */
export default function GoogleCallbackPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const dispatch     = useAppDispatch();

  useEffect(() => {
    const token = searchParams.get('token');
    const userRaw = searchParams.get('user');
    const error = searchParams.get('error');

    if (error || !token || !userRaw) {
      dispatch(addToast({
        type: 'error',
        title: 'Google sign-in failed',
        message: 'Could not complete Google authentication. Please try again.',
      }));
      router.replace('/auth/login');
      return;
    }

    try {
      const user = JSON.parse(decodeURIComponent(userRaw));

      // Store token and user in Redux + localStorage
      dispatch(setGoogleAuthUser({ user, accessToken: token }));

      dispatch(addToast({
        type: 'success',
        title: `Welcome, ${user.first_name}!`,
        message: 'Signed in with Google.',
      }));

      router.replace('/dashboard');
    } catch {
      dispatch(addToast({
        type: 'error',
        title: 'Sign-in error',
        message: 'Could not parse auth data. Please try again.',
      }));
      router.replace('/auth/login');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-muted">
        <Loader2 className="size-10 animate-spin text-accent" />
        <p className="text-sm font-medium">Completing Google sign-in…</p>
      </div>
    </div>
  );
}
