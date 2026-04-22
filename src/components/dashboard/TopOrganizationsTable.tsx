'use client';

import { Trophy } from 'lucide-react';

import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import type { TopOrganizationItem } from '@/types/dashboard';
import {
  formatPercent,
  formatRiskLabel,
  getRiskClasses,
  getScoreBarColor,
} from '@/components/dashboard/utils';

export function TopOrganizationsTable({
  data,
}: {
  data: TopOrganizationItem[];
}) {
  return (
    <Card className='overflow-hidden border-slate-200 bg-white shadow-sm transition duration-200 hover:scale-[1.01] hover:shadow-md'>
      <CardHeader className='border-slate-200'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700'>
            <Trophy className='h-5 w-5' />
          </div>
          <div>
            <h2 className='text-lg font-semibold text-slate-300'>
              Top Organizations
            </h2>
            <p className='text-sm text-slate-500'>
              Highest latest-readiness scores and associated current risk posture.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className='p-6'>
        {data.length ? (
          <div className='overflow-hidden rounded-2xl border border-slate-200'>
            <div className='grid grid-cols-[72px_minmax(0,1.6fr)_minmax(0,1.2fr)_minmax(0,1fr)] bg-slate-700 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-300'>
              <span>Rank</span>
              <span>Organization Name</span>
              <span>Readiness Score</span>
              <span>Risk Level</span>
            </div>
            {data.slice(0, 5).map((organization, index) => (
              <div
                key={organization.name}
                className={`grid grid-cols-[72px_minmax(0,1.6fr)_minmax(0,1.2fr)_minmax(0,1fr)] items-center gap-4 px-4 py-4 ${
                  index % 2 === 0 ? 'bg-slate-700' : 'bg-slate-50/70'
                }`}>
                <span className='text-sm font-semibold text-slate-300'>
                  #{index + 1}
                </span>
                <span className='truncate text-sm font-medium text-slate-300'>
                  {organization.name}
                </span>
                <div className='space-y-2'>
                  <div className='flex items-center justify-between text-xs text-slate-300'>
                    <span>{formatPercent(organization.score)}</span>
                  </div>
                  <div className='h-2.5 overflow-hidden rounded-full bg-slate-300'>
                    <div
                      className={`h-full rounded-full ${getScoreBarColor(
                        organization.score,
                      )}`}
                      style={{ width: `${Math.max(organization.score, 4)}%` }}
                    />
                  </div>
                </div>
                <span
                  className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${getRiskClasses(
                    organization.risk,
                  )}`}>
                  {formatRiskLabel(organization.risk)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className='flex h-56 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-700 text-center'>
            <p className='text-sm font-medium text-slate-300'>
              No organizations assessed yet
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
