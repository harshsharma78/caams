import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { OrganizationForm } from '@/components/forms/OrganizationForm';
import { PageHeader } from '@/components/layout/PageHeader';
import { auth } from '@/lib/auth';
import { canManageOrganizations } from '@/lib/permissions';

export const metadata: Metadata = {
  title: 'CAAMS | New Organization',
};

export default async function NewOrganizationPage() {
  const session = await auth();

  if (!session?.user || !canManageOrganizations(session.user.role)) {
    redirect('/organizations');
  }

  return (
    <div className='space-y-8'>
      <PageHeader
        title='New organization'
        description='Add a business profile to begin assessments, interviews, and risk reviews.'
      />
      <OrganizationForm mode='create' />
    </div>
  );
}
