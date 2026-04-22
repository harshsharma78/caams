import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { DeleteInterviewButton } from '@/components/forms/DeleteInterviewButton';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { auth } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { canManageInterviews } from '@/lib/permissions';
import Interview from '@/models/Interview';

export const metadata: Metadata = {
  title: 'CAAMS | Interview Details',
};

export default async function InterviewDetailPage({
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

  const interview = await Interview.findById(id)
    .populate('orgId', 'name')
    .populate('conductedBy', 'name email role')
    .lean();

  if (!interview) {
    notFound();
  }

  const org =
    interview.orgId &&
    typeof interview.orgId === 'object' &&
    'name' in interview.orgId
      ? interview.orgId
      : null;

  const conductedBy =
    interview.conductedBy &&
    typeof interview.conductedBy === 'object' &&
    'name' in interview.conductedBy
      ? interview.conductedBy
      : null;

  const canManage = canManageInterviews(session.user.role);

  return (
    <div className='space-y-8'>
      <PageHeader
        title={`Interview — ${interview.intervieweeName}`}
        description='Detailed view of the recorded IT professional interview.'
        action={
          canManage ? (
            <DeleteInterviewButton
              id={interview._id.toString()}
              intervieweeName={interview.intervieweeName}
            />
          ) : undefined
        }
      />

      {/* Interviewee profile */}
      <div className='grid gap-6 xl:grid-cols-[1.15fr_0.85fr]'>
        <Card>
          <CardHeader>
            <h2 className='text-xl font-semibold text-slate-900 dark:text-slate-50'>
              Interviewee profile
            </h2>
          </CardHeader>
          <CardContent className='grid gap-5 md:grid-cols-2'>
            <div>
              <p className='text-sm text-slate-500 dark:text-slate-400'>
                Full name
              </p>
              <p className='mt-1 font-medium text-slate-900 dark:text-slate-50'>
                {interview.intervieweeName}
              </p>
            </div>
            <div>
              <p className='text-sm text-slate-500 dark:text-slate-400'>
                Designation
              </p>
              <p className='mt-1 font-medium text-slate-900 dark:text-slate-50'>
                {interview.designation}
              </p>
            </div>
            <div>
              <p className='text-sm text-slate-500 dark:text-slate-400'>
                Department
              </p>
              <p className='mt-1 font-medium text-slate-900 dark:text-slate-50'>
                {interview.department}
              </p>
            </div>
            <div>
              <p className='text-sm text-slate-500 dark:text-slate-400'>
                Experience
              </p>
              <p className='mt-1 font-medium text-slate-900 dark:text-slate-50'>
                {interview.experience}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className='text-xl font-semibold text-slate-900 dark:text-slate-50'>
              Interview metadata
            </h2>
          </CardHeader>
          <CardContent className='space-y-5'>
            <div>
              <p className='text-sm text-slate-500 dark:text-slate-400'>
                Organization
              </p>
              {org ? (
                <Link
                  href={`/organizations/${org._id.toString()}`}
                  className='mt-1 block font-medium text-sky-600 hover:text-sky-700'>
                  {org.name}
                </Link>
              ) : (
                <p className='mt-1 font-medium text-slate-900 dark:text-slate-50'>
                  Unknown
                </p>
              )}
            </div>
            <div>
              <p className='text-sm text-slate-500 dark:text-slate-400'>
                Date conducted
              </p>
              <p className='mt-1 font-medium text-slate-900 dark:text-slate-50'>
                {new Intl.DateTimeFormat('en-IN', {
                  dateStyle: 'full',
                  timeStyle: 'short',
                }).format(interview.date)}
              </p>
            </div>
            <div>
              <p className='text-sm text-slate-500 dark:text-slate-400'>
                Conducted by
              </p>
              <p className='mt-1 font-medium text-slate-900 dark:text-slate-50'>
                {conductedBy ? conductedBy.name : 'Unknown'}
              </p>
            </div>
            {interview.fileUrl ? (
              <div>
                <p className='text-sm text-slate-500 dark:text-slate-400'>
                  Attachment
                </p>
                <a
                  href={interview.fileUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='mt-1 inline-flex items-center gap-1.5 font-medium text-sky-600 transition hover:text-sky-700'>
                  View transcript / audio ↗
                </a>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {/* Responses */}
      <Card>
        <CardHeader>
          <h2 className='text-xl font-semibold text-slate-900 dark:text-slate-50'>
            Interview responses
          </h2>
        </CardHeader>
        <CardContent className='space-y-8'>
          {interview.responses.map(
            (response: { question: string; answer: string }, index: number) => (
              <div
                key={index}
                className='space-y-2'>
                <div className='flex items-start gap-3'>
                  <span className='mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-xs font-bold text-sky-700 dark:bg-sky-950 dark:text-sky-300'>
                    {index + 1}
                  </span>
                  <p className='text-sm font-semibold leading-relaxed text-slate-800 dark:text-slate-200'>
                    {response.question}
                  </p>
                </div>
                <div className='pl-10'>
                  {response.answer ? (
                    <p className='whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-300'>
                      {response.answer}
                    </p>
                  ) : (
                    <Badge variant='warning'>No response recorded</Badge>
                  )}
                </div>
              </div>
            ),
          )}
        </CardContent>
      </Card>

      {/* Back link */}
      <div className='flex'>
        <Link href='/interviews'>
          <Button variant='outline'>← Back to interviews</Button>
        </Link>
      </div>
    </div>
  );
}
