import type { Metadata } from 'next';

import { PageHeader } from '@/components/layout/PageHeader';
import { OrganizationTable } from '@/components/organizations/OrganizationTable';
import { Card, CardContent } from '@/components/ui/Card';
import { auth } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { canManageOrganizations } from '@/lib/permissions';
import Assessment from '@/models/Assessment';
import Organization from '@/models/Organization';

export const metadata: Metadata = {
  title: 'CAAMS | Organizations',
};

export default async function OrganizationsPage() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  await dbConnect();

  const organizations = await Organization.find({})
    .sort({ createdAt: -1 })
    .lean();
  const counts = await Assessment.aggregate<{ _id: string; count: number }>([
    { $group: { _id: '$orgId', count: { $sum: 1 } } },
  ]);

  const countMap = new Map(
    counts.map((item) => [item._id.toString(), item.count]),
  );
  const canManage = canManageOrganizations(session.user.role);

  const rows = organizations.map((organization) => ({
    id: organization._id.toString(),
    name: organization.name,
    sector: organization.sector,
    industry: organization.industry,
    size: organization.size,
    createdAt: organization.createdAt
      ? new Date(organization.createdAt).toISOString()
      : new Date().toISOString(),
    assessmentCount: countMap.get(organization._id.toString()) ?? 0,
  }));

  return (
    <div className='space-y-8'>
      <PageHeader
        title='Organizations'
        description='Manage customer profiles, contact details, and linked cloud readiness work.'
        actionHref={canManage ? '/organizations/new' : undefined}
        actionLabel={canManage ? 'Add organization' : undefined}
      />
      <Card>
        <CardContent className='p-0'>
          <OrganizationTable
            organizations={rows}
            canManage={canManage}
          />
        </CardContent>
      </Card>
    </div>
  );
}
