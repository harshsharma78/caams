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
          <div className='overflow-x-auto rounded-2xl border border-slate-200'>
            <table className='min-w-full'>
              <thead className='bg-slate-700 text-xs font-semibold uppercase tracking-wide text-slate-300'>
                <tr>
                  <th className='px-4 py-3 text-left'>Rank</th>
                  <th className='px-4 py-3 text-left'>Organization Name</th>
                  <th className='px-4 py-3 text-left'>Readiness Score</th>
                  <th className='px-4 py-3 text-left'>Risk Level</th>
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 5).map((organization, index) => (
                  <tr
                    key={organization.name}
                    className={`border-t border-slate-600 text-sm transition-colors hover:bg-slate-600/40 ${
                      index % 2 === 0 ? 'bg-slate-700' : 'bg-slate-50/70'
                    }`}>
                    <td className='px-4 py-4 font-semibold text-slate-300'>
                      #{index + 1}
                    </td>
                    <td className='px-4 py-4 font-medium text-slate-300'>
                      {organization.name}
                    </td>
                    <td className='px-4 py-4'>
                      <div className="min-w-30 space-y-2">
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
                    </td>
                    <td className='px-4 py-4'>
                      <span
                        className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${getRiskClasses(
                          organization.risk,
                        )}`}>
                        {formatRiskLabel(organization.risk)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
