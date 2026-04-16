'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { AssessmentListItem, OrganizationListItem } from '@/types';

interface AssessmentListProps {
  assessments: AssessmentListItem[];
  organizations: Pick<OrganizationListItem, 'id' | 'name'>[];
}

export function AssessmentList({
  assessments,
  organizations,
}: AssessmentListProps) {
  const [organizationId, setOrganizationId] = useState('all');
  const [minScore, setMinScore] = useState('');
  const [maxScore, setMaxScore] = useState('');

  const filteredAssessments = useMemo(() => {
    return assessments.filter((assessment) => {
      const matchesOrganization =
        organizationId === 'all' ||
        assessment.organizationId === organizationId;
      const matchesMin =
        !minScore || assessment.overallScore >= Number(minScore);
      const matchesMax =
        !maxScore || assessment.overallScore <= Number(maxScore);

      return matchesOrganization && matchesMin && matchesMax;
    });
  }, [assessments, maxScore, minScore, organizationId]);

  return (
    <Card>
      <CardContent className='space-y-6 p-6'>
        <div className='grid gap-4 md:grid-cols-[1.2fr_0.4fr_0.4fr]'>
          <label className='block space-y-1.5'>
            <span className='text-sm font-medium text-slate-700 dark:text-slate-200'>
              Organization
            </span>
            <Select
              value={organizationId}
              onValueChange={setOrganizationId}>
              <SelectTrigger>
                <SelectValue placeholder='All organizations' />
              </SelectTrigger>
              <SelectContent className='border-slate-300 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50'>
                <SelectItem value='all'>All organizations</SelectItem>
                {organizations.map((organization) => (
                  <SelectItem
                    key={organization.id}
                    value={organization.id}>
                    {organization.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          <Input
            label='Min score'
            type='number'
            min={0}
            max={100}
            value={minScore}
            onChange={(event) => setMinScore(event.target.value)}
            placeholder='0'
          />
          <Input
            label='Max score'
            type='number'
            min={0}
            max={100}
            value={maxScore}
            onChange={(event) => setMaxScore(event.target.value)}
            placeholder='100'
          />
        </div>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-slate-200 dark:divide-slate-800'>
            <thead className='bg-slate-50 dark:bg-slate-950'>
              <tr className='text-left text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400'>
                <th className='px-6 py-4'>Organization</th>
                <th className='px-6 py-4'>Score</th>
                <th className='px-6 py-4'>Date</th>
                <th className='px-6 py-4'>Status</th>
                <th className='px-6 py-4'>Actions</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-200 text-sm dark:divide-slate-800'>
              {filteredAssessments.length ? (
                filteredAssessments.map((assessment) => (
                  <tr key={assessment.id}>
                    <td className='px-6 py-4'>
                      <div className='space-y-1'>
                        <Link
                          href={`/assessments/${assessment.id}`}
                          className='font-medium text-slate-900 hover:text-sky-600 dark:text-slate-50'>
                          {assessment.organizationName}
                        </Link>
                        <p className='line-clamp-1 text-slate-500 dark:text-slate-400'>
                          {assessment.recommendation}
                        </p>
                      </div>
                    </td>
                    <td className='px-6 py-4'>
                      <Badge className='border border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'>
                        {assessment.overallScore.toFixed(1)} / 100
                      </Badge>
                    </td>
                    <td className='px-6 py-4 text-slate-600 dark:text-slate-300'>
                      {new Intl.DateTimeFormat('en-IN', {
                        dateStyle: 'medium',
                      }).format(new Date(assessment.createdAt))}
                    </td>
                    <td className='px-6 py-4'>
                      <span
                        className={cn(
                          'inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em]',
                          assessment.statusColor === 'bg-rose-500' &&
                            'border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300',
                          assessment.statusColor === 'bg-orange-500' &&
                            'border border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-950 dark:text-orange-300',
                          assessment.statusColor === 'bg-amber-400' &&
                            'border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300',
                          assessment.statusColor === 'bg-emerald-500' &&
                            'border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300',
                        )}>
                        {assessment.statusLabel}
                      </span>
                    </td>
                    <td className='px-6 py-4'>
                      <Link
                        href={`/assessments/${assessment.id}`}
                        className='font-medium text-sky-600 transition hover:text-sky-700'>
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className='px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400'>
                    No assessments match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
