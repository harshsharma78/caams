'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import { Search, ShieldAlert } from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getSecurityRiskLevel } from '@/lib/securityEngine';
import { cn } from '@/lib/utils';
import type { SecurityAssessmentListItem } from '@/types';

interface SecurityAssessmentListProps {
  assessments: SecurityAssessmentListItem[];
}

export function SecurityAssessmentList({
  assessments,
}: SecurityAssessmentListProps) {
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');

  const filteredAssessments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return assessments.filter((assessment) => {
      const matchesSearch =
        !query || assessment.organizationName.toLowerCase().includes(query);
      const matchesRisk =
        riskFilter === 'all' || assessment.overallRisk === riskFilter;

      return matchesSearch && matchesRisk;
    });
  }, [assessments, riskFilter, search]);

  return (
    <div className='space-y-6'>
      <Card>
        <CardContent className='grid gap-4 md:grid-cols-[1.6fr_0.8fr]'>
          <Input
            label='Search'
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder='Search by organization'
          />
          <label className='block space-y-1.5'>
            <span className='text-sm font-medium text-slate-700 dark:text-slate-200'>
              Risk level
            </span>
            <Select
              value={riskFilter}
              onValueChange={setRiskFilter}>
              <SelectTrigger>
                <SelectValue placeholder='Filter by risk level' />
              </SelectTrigger>
              <SelectContent className='border-slate-300 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50'>
                <SelectItem value='all'>All levels</SelectItem>
                <SelectItem value='low'>Low</SelectItem>
                <SelectItem value='medium'>Medium</SelectItem>
                <SelectItem value='high'>High</SelectItem>
                <SelectItem value='critical'>Critical</SelectItem>
              </SelectContent>
            </Select>
          </label>
        </CardContent>
      </Card>

      <div className='grid gap-5 md:grid-cols-2 xl:grid-cols-3'>
        {filteredAssessments.map((assessment) => {
          const risk = getSecurityRiskLevel(assessment.score);

          return (
            <Card
              key={assessment.id}
              className='overflow-hidden'>
              <CardContent className='flex h-full flex-col gap-4'>
                <div className='flex flex-wrap items-center gap-2'>
                  <span
                    className={cn(
                      'inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em]',
                      risk.badgeClassName,
                    )}>
                    {risk.label}
                  </span>
                  <Badge variant='outline'>{assessment.score} / 60</Badge>
                </div>
                <div>
                  <h2 className='text-xl font-semibold text-slate-900 dark:text-slate-50'>
                    {assessment.organizationName}
                  </h2>
                  <p className='mt-1 text-sm text-slate-500 dark:text-slate-400'>
                    Conducted{' '}
                    {new Intl.DateTimeFormat('en-IN', {
                      dateStyle: 'medium',
                    }).format(new Date(assessment.createdAt))}
                  </p>
                </div>
                <p className='text-sm text-slate-600 dark:text-slate-300'>
                  Reviewer:{' '}
                  {assessment.conductedBy?.name ?? 'Unknown reviewer'}
                </p>
                <div className='mt-auto'>
                  <Button asChild>
                    <Link href={`/security/${assessment.id}`}>View assessment</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {!filteredAssessments.length ? (
        assessments.length === 0 ? (
          <EmptyState
            icon={<ShieldAlert className="h-8 w-8" />}
            title="No security assessments"
            description="Start evaluating the security posture of your organizations."
            actionLabel="Add security check"
            actionHref="/security/new"
          />
        ) : (
          <EmptyState
            icon={<Search className="h-8 w-8" />}
            title="No matches found"
            description="No security assessments match the current filters."
            actionLabel="Clear filters"
            onAction={() => {
              setSearch('');
              setRiskFilter('all');
            }}
          />
        )
      ) : null}
    </div>
  );
}
