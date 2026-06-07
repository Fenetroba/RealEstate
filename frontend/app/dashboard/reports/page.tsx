import { redirect } from 'next/navigation';

/** Reports was removed from the admin nav; keep a safe redirect for old links. */
export default function ReportsRedirectPage() {
  redirect('/dashboard');
}
