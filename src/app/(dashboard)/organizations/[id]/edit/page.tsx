import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { OrganizationForm } from '@/components/forms/OrganizationForm';
import { PageHeader } from '@/components/layout/PageHeader';
import { auth } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { canManageOrganizations } from '@/lib/permissions';
import Organization from '@/models/Organization';

export const metadata: Metadata = {
  title: 'CAAMS | Edit Organization',
};

export default async function EditOrganizationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user || !canManageOrganizations(session.user.role)) {
    redirect('/organizations');
  }

  await dbConnect();

  const organization = await Organization.findById(id).lean();

  if (!organization) {
    redirect('/organizations');
  }

  return (
    <div className='space-y-8'>
      <PageHeader
        title={`Edit ${organization.name}`}
        description='Update organization metadata, contacts, and branding.'
      />
      <OrganizationForm
        mode='edit'
        organizationId={organization._id.toString()}
        initialValues={{
          name: organization.name,
          industry: organization.industry,
          size: organization.size,
          sector: organization.sector,
          address: organization.address,
          contactPerson: organization.contactPerson,
          email: organization.email,
          phone: organization.phone,
          logoUrl: organization.logoUrl,
        }}
      />
    </div>
  );
}
