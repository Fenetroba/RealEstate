'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { PropertyRegistrationForm } from '@/components/submit/PropertyRegistrationForm';
import { Button } from '@/components/ui/Button';

export default function SubmitPropertyRegistrationPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        title="Submit property registration"
        description="Fill in your property details and upload photos. An admin will review and publish it."
        actions={
          <Link href="/dashboard/my-requests">
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="size-4" />}>
              My requests
            </Button>
          </Link>
        }
      />
      <div className="mx-auto max-w-3xl">
        <PropertyRegistrationForm />
      </div>
    </DashboardShell>
  );
}
