import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { DeleteOrganizationButton } from '@/components/forms/DeleteOrganizationButton';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { auth } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { canManageOrganizations } from '@/lib/permissions';
import Assessment from '@/models/Assessment';
import Organization from '@/models/Organization';

export const metadata: Metadata = {
  title: 'CAAMS | Organization Details',
};

export default async function OrganizationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    notFound();
  }

  await dbConnect();

  const [organization, assessmentCount] = await Promise.all([
    Organization.findById(id).populate('createdBy', 'name email role').lean(),
    Assessment.countDocuments({ orgId: id }),
  ]);

  if (!organization) {
    notFound();
  }

  const canManage = canManageOrganizations(session.user.role);

  return (
    <div className='space-y-8'>
      <PageHeader
        title={organization.name}
        description='Organization profile, contact information, and linked assessment summary.'
        action={
          canManage ? (
            <div className='flex gap-3'>
              <Link href={`/organizations/${organization._id.toString()}/edit`}>
                <Button variant='outline'>Edit organization</Button>
              </Link>
              <DeleteOrganizationButton
                id={organization._id.toString()}
                name={organization.name}
              />
            </div>
          ) : undefined
        }
      />
      <div className='grid gap-6 xl:grid-cols-[1.15fr_0.85fr]'>
        <Card>
          <CardHeader>
            <h2 className='text-xl font-semibold text-slate-900 dark:text-slate-50'>
              Profile
            </h2>
          </CardHeader>
          <CardContent className='grid gap-5 md:grid-cols-2'>
            <div>
              <p className='text-sm text-slate-500 dark:text-slate-400'>
                Industry
              </p>
              <p className='mt-1 font-medium text-slate-900 dark:text-slate-50'>
                {organization.industry}
              </p>
            </div>
            <div>
              <p className='text-sm text-slate-500 dark:text-slate-400'>Size</p>
              <div className='mt-2'>
                <Badge>{organization.size}</Badge>
              </div>
            </div>
            <div>
              <p className='text-sm text-slate-500 dark:text-slate-400'>
                Sector
              </p>
              <p className='mt-1 font-medium text-slate-900 dark:text-slate-50'>
                {organization.sector}
              </p>
            </div>
            <div>
              <p className='text-sm text-slate-500 dark:text-slate-400'>
                Created
              </p>
              <p className='mt-1 font-medium text-slate-900 dark:text-slate-50'>
                {new Intl.DateTimeFormat('en-IN', {
                  dateStyle: 'medium',
                }).format(organization.createdAt)}
              </p>
            </div>
            <div className='md:col-span-2'>
              <p className='text-sm text-slate-500 dark:text-slate-400'>
                Address
              </p>
              <p className='mt-1 font-medium text-slate-900 dark:text-slate-50'>
                {organization.address}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h2 className='text-xl font-semibold text-slate-900 dark:text-slate-50'>
              Contacts and assets
            </h2>
          </CardHeader>
          <CardContent className='space-y-5'>
            <div>
              <p className='text-sm text-slate-500 dark:text-slate-400'>
                Contact person
              </p>
              <p className='mt-1 font-medium text-slate-900 dark:text-slate-50'>
                {organization.contactPerson}
              </p>
            </div>
            <div>
              <p className='text-sm text-slate-500 dark:text-slate-400'>
                Email
              </p>
              <p className='mt-1 font-medium text-slate-900 dark:text-slate-50'>
                {organization.email}
              </p>
            </div>
            <div>
              <p className='text-sm text-slate-500 dark:text-slate-400'>
                Phone
              </p>
              <p className='mt-1 font-medium text-slate-900 dark:text-slate-50'>
                {organization.phone}
              </p>
            </div>
            <div>
              <p className='text-sm text-slate-500 dark:text-slate-400'>
                Linked assessments
              </p>
              <p className='mt-1 text-3xl font-semibold text-slate-900 dark:text-slate-50'>
                {assessmentCount}
              </p>
            </div>
            {organization.logoUrl ? (
              <div className='rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950'>
                <Image
                  src={organization.logoUrl}
                  alt={`${organization.name} logo`}
                  width={140}
                  height={140}
                  className='h-28 w-28 rounded-2xl object-cover'
                />
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
