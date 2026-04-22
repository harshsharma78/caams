import type { Metadata } from 'next';
import Link from 'next/link';

import { Users } from 'lucide-react';

import { InterviewFilters } from '@/components/forms/InterviewFilters';
import { DeleteInterviewButton } from '@/components/forms/DeleteInterviewButton';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { auth } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { canManageInterviews } from '@/lib/permissions';
import Interview from '@/models/Interview';
import Organization from '@/models/Organization';

export const metadata: Metadata = {
  title: 'CAAMS | Interviews',
};

interface InterviewsPageProps {
  searchParams: Promise<{
    orgId?: string;
    dateFrom?: string;
    dateTo?: string;
  }>;
}

export default async function InterviewsPage({
  searchParams,
}: InterviewsPageProps) {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  const { orgId, dateFrom, dateTo } = await searchParams;

  await dbConnect();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = {};

  if (orgId) {
    filter.orgId = orgId;
  }

  if (dateFrom || dateTo) {
    filter.date = {};

    if (dateFrom) {
      filter.date.$gte = new Date(dateFrom);
    }

    if (dateTo) {
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      filter.date.$lte = end;
    }
  }

  const [interviews, organizations] = await Promise.all([
    Interview.find(filter)
      .populate('orgId', 'name')
      .populate('conductedBy', 'name')
      .sort({ date: -1 })
      .lean(),
    Organization.find({}).sort({ name: 1 }).lean(),
  ]);

  const canManage = canManageInterviews(session.user.role);

  return (
    <div className='space-y-8'>
      <PageHeader
        title='Interviews'
        description='Structured IT professional interviews about cloud computing experiences.'
        actionHref={canManage ? '/interviews/new' : undefined}
        actionLabel={canManage ? 'New interview' : undefined}
      />
      <InterviewFilters
        organizations={organizations.map((org) => ({
          id: org._id.toString(),
          name: org.name,
        }))}
        currentOrgId={orgId}
        currentDateFrom={dateFrom}
        currentDateTo={dateTo}
      />
      <Card>
        <CardContent className='p-0'>
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-slate-200 dark:divide-slate-800'>
              <thead className='bg-slate-50 dark:bg-slate-950'>
                <tr className='text-left text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400'>
                  <th className='px-6 py-4'>Interviewee</th>
                  <th className='px-6 py-4'>Organization</th>
                  <th className='px-6 py-4'>Designation</th>
                  <th className='px-6 py-4'>Department</th>
                  <th className='px-6 py-4'>Date</th>
                  <th className='px-6 py-4'>Actions</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-200 text-sm dark:divide-slate-800'>
                {interviews.length ? (
                  interviews.map((interview) => {
                    const org =
                      interview.orgId &&
                      typeof interview.orgId === 'object' &&
                      'name' in interview.orgId
                        ? interview.orgId
                        : null;

                    return (
                      <tr key={interview._id.toString()}>
                        <td className='px-6 py-4'>
                          <div className='space-y-1'>
                            <Link
                              href={`/interviews/${interview._id.toString()}`}
                              className='font-medium text-slate-900 hover:text-sky-600 dark:text-slate-50'>
                              {interview.intervieweeName}
                            </Link>
                            <p className='text-slate-500 dark:text-slate-400'>
                              {interview.experience} experience
                            </p>
                          </div>
                        </td>
                        <td className='px-6 py-4 text-slate-600 dark:text-slate-300'>
                          {org ? (
                            <Link
                              href={`/organizations/${org._id.toString()}`}
                              className='hover:text-sky-600'>
                              {org.name}
                            </Link>
                          ) : (
                            'Unknown'
                          )}
                        </td>
                        <td className='px-6 py-4 text-slate-600 dark:text-slate-300'>
                          {interview.designation}
                        </td>
                        <td className='px-6 py-4 text-slate-600 dark:text-slate-300'>
                          {interview.department}
                        </td>
                        <td className='px-6 py-4 text-slate-600 dark:text-slate-300'>
                          {new Intl.DateTimeFormat('en-IN', {
                            dateStyle: 'medium',
                          }).format(interview.date)}
                        </td>
                        <td className='px-6 py-4'>
                          <div className='flex items-center gap-4'>
                            <Link
                              href={`/interviews/${interview._id.toString()}`}
                              className='font-medium text-sky-600 transition hover:text-sky-700'>
                              View
                            </Link>
                            {canManage ? (
                              <DeleteInterviewButton
                                id={interview._id.toString()}
                                intervieweeName={interview.intervieweeName}
                              />
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className='p-0'>
                      <EmptyState
                        icon={<Users className="h-8 w-8" />}
                        title="No interviews"
                        description="Record cloud computing experience interviews."
                        actionLabel={canManage ? "New interview" : undefined}
                        actionHref={canManage ? "/interviews/new" : undefined}
                      />
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
