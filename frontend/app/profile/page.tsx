import { redirect } from 'next/navigation';

/** Legacy route — profile lives in the dashboard shell. */
export default function ProfileRedirectPage() {
  redirect('/dashboard/profile');
}
