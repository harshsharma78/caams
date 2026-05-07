'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import { Users } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { DeleteInterviewButton } from '@/components/forms/DeleteInterviewButton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';

const PAGE_SIZE = 10;

interface InterviewRow {
  id: string;
  intervieweeName: string;
  experience: string;
  orgName: string | null;
  orgId: string | null;
  designation: string;
  department: string;
  date: string;
}

interface InterviewTableProps {
  interviews: InterviewRow[];
  canManage: boolean;
}

export function InterviewTable({
  interviews,
  canManage,
}: InterviewTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalItems = interviews.length;
  const pageCount = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const safePage = Math.min(currentPage, pageCount);

  const pagedInterviews = useMemo(
    () =>
      interviews.slice(
        (safePage - 1) * PAGE_SIZE,
        safePage * PAGE_SIZE,
      ),
    [interviews, safePage],
  );

  return (
    <>
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
            {pagedInterviews.length ? (
              pagedInterviews.map((interview) => (
                <tr key={interview.id}>
                  <td className='px-6 py-4'>
                    <div className='space-y-1'>
                      <Link
                        href={`/interviews/${interview.id}`}
                        className='font-medium text-slate-900 hover:text-sky-600 dark:text-slate-50'>
                        {interview.intervieweeName}
                      </Link>
                      <p className='text-slate-500 dark:text-slate-400'>
                        {interview.experience} experience
                      </p>
                    </div>
                  </td>
                  <td className='px-6 py-4 text-slate-600 dark:text-slate-300'>
                    {interview.orgName && interview.orgId ? (
                      <Link
                        href={`/organizations/${interview.orgId}`}
                        className='hover:text-sky-600'>
                        {interview.orgName}
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
                    }).format(new Date(interview.date))}
                  </td>
                  <td className='px-6 py-4'>
                    <div className='flex items-center gap-2'>
                      <Button asChild variant='outline' size='sm'>
                        <Link href={`/interviews/${interview.id}`}>
                          View
                        </Link>
                      </Button>
                      {canManage ? (
                        <DeleteInterviewButton
                          id={interview.id}
                          intervieweeName={interview.intervieweeName}
                        />
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))
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
      {totalItems > PAGE_SIZE && (
        <Pagination
          currentPage={safePage}
          totalItems={totalItems}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
          itemLabel='interviews'
        />
      )}
    </>
  );
}
