import type { Metadata } from 'next';

import { InterviewFilters } from '@/components/forms/InterviewFilters';
import { InterviewTable } from '@/components/interviews/InterviewTable';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
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

  const rows = interviews.map((interview) => {
    const org =
      interview.orgId &&
      typeof interview.orgId === 'object' &&
      'name' in interview.orgId
        ? interview.orgId
        : null;

    return {
      id: interview._id.toString(),
      intervieweeName: interview.intervieweeName,
      experience: interview.experience,
      orgName: org ? (org as { name: string }).name : null,
      orgId: org ? (org as { _id: { toString(): string } })._id.toString() : null,
      designation: interview.designation,
      department: interview.department,
      date: new Date(interview.date).toISOString(),
    };
  });

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
          <InterviewTable
            interviews={rows}
            canManage={canManage}
          />
        </CardContent>
      </Card>
    </div>
  );
}
