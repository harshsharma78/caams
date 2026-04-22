import type { Metadata } from 'next';
import Link from 'next/link';

import { DeleteOrganizationButton } from '@/components/forms/DeleteOrganizationButton';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
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
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-slate-200 dark:divide-slate-800'>
              <thead className='bg-slate-50 dark:bg-slate-950'>
                <tr className='text-left text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400'>
                  <th className='px-6 py-4'>Name</th>
                  <th className='px-6 py-4'>Industry</th>
                  <th className='px-6 py-4'>Size</th>
                  <th className='px-6 py-4'>Created</th>
                  <th className='px-6 py-4'>Assessments</th>
                  <th className='px-6 py-4'>Actions</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-200 text-sm dark:divide-slate-800'>
                {organizations.length ? (
                  organizations.map((organization) => (
                    <tr key={organization._id.toString()}>
                      <td className='px-6 py-4'>
                        <div className='space-y-1'>
                          <Link
                            href={`/organizations/${organization._id.toString()}`}
                            className='font-medium text-slate-900 hover:text-sky-600 dark:text-slate-50'>
                            {organization.name}
                          </Link>
                          <p className='text-slate-500 dark:text-slate-400'>
                            {organization.sector}
                          </p>
                        </div>
                      </td>
                      <td className='px-6 py-4 text-slate-600 dark:text-slate-300'>
                        {organization.industry}
                      </td>
                      <td className='px-6 py-4'>
                        <Badge>{organization.size}</Badge>
                      </td>
                      <td className='px-6 py-4 text-slate-600 dark:text-slate-300'>
                        {new Intl.DateTimeFormat('en-IN', {
                          dateStyle: 'medium',
                        }).format(organization.createdAt)}
                      </td>
                      <td className='px-6 py-4 text-slate-600 dark:text-slate-300'>
                        {countMap.get(organization._id.toString()) ?? 0}
                      </td>
                      <td className='px-6 py-4'>
                        <div className='flex items-center gap-4'>
                          <Link
                            href={`/organizations/${organization._id.toString()}`}
                            className='font-medium text-sky-600 transition hover:text-sky-700'>
                            View
                          </Link>
                          {canManage ? (
                            <>
                              <Link
                                href={`/organizations/${organization._id.toString()}/edit`}
                                className='font-medium text-slate-700 transition hover:text-slate-900 dark:text-slate-200 dark:hover:text-white'>
                                Edit
                              </Link>
                              <DeleteOrganizationButton
                                id={organization._id.toString()}
                                name={organization.name}
                              />
                            </>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      className='px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400'
                      colSpan={6}>
                      No organizations have been created yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
