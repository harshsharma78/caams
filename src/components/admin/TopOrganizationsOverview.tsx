'use client';

import { useEffect, useMemo, useState } from 'react';

import type { AdminTopOrganizationItem } from '@/types/admin-dashboard';
import { planBadge, riskBadge } from '@/components/admin/utils';
import { AdminPagination } from '@/components/ui/Pagination';

const PAGE_SIZE = 10;

function scoreBar(score: number) {
  if (score >= 81) return 'bg-emerald-500';
  if (score >= 61) return 'bg-yellow-400';
  if (score >= 41) return 'bg-orange-500';
  return 'bg-red-500';
}

export function TopOrganizationsOverview({
  data,
}: {
  data: AdminTopOrganizationItem[];
}) {
  const [currentPage, setCurrentPage] = useState(1);

  const pageCount = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;

  const pagedData = useMemo(
    () => data.slice(startIndex, startIndex + PAGE_SIZE),
    [data, startIndex],
  );

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, pageCount));
  }, [pageCount]);

  return (
    <div className='rounded-xl border border-slate-700/60 bg-[#1A1D27] shadow-sm'>
      <div className='border-b border-slate-800 px-6 py-5'>
        <h3 className='text-lg font-semibold text-slate-100'>
          Top Organizations Overview
        </h3>
        <p className='text-sm text-slate-400'>
          Most active organizations by assessment volume and latest readiness score.
        </p>
      </div>
      {data.length ? (
        <>
          <div className='overflow-x-auto'>
            <table className='min-w-full'>
              <thead className='sticky top-0 z-10 bg-slate-800/60 text-xs uppercase tracking-wide text-slate-400'>
                <tr>
                  <th className='px-4 py-3 text-left'>Rank</th>
                  <th className='px-4 py-3 text-left'>Organization</th>
                  <th className='px-4 py-3 text-left'>Industry</th>
                  <th className='px-4 py-3 text-left'>Plan</th>
                  <th className='px-4 py-3 text-left'>Readiness Score</th>
                  <th className='px-4 py-3 text-left'>Risk Level</th>
                  <th className='px-4 py-3 text-left'>Last Activity</th>
                  <th className='px-4 py-3 text-left'>Assessments</th>
                </tr>
              </thead>
              <tbody>
                {pagedData.map((item, index) => (
                  <tr
                    key={item.name}
                    className={`border-t border-slate-800 text-sm transition-colors hover:bg-slate-800/40 ${
                      index % 2 === 0 ? 'bg-slate-900/20' : ''
                    }`}>
                    <td className='px-4 py-4 text-slate-400'>#{startIndex + index + 1}</td>
                    <td className='px-4 py-4 text-slate-200'>{item.name}</td>
                    <td className='px-4 py-4 text-slate-400'>{item.industry}</td>
                    <td className='px-4 py-4'>
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${planBadge(item.plan)}`}>
                        {item.plan}
                      </span>
                    </td>
                    <td className='px-4 py-4'>
                      <div className='min-w-35'>
                        <div className='mb-2 text-xs text-slate-400'>
                          {item.latestScore.toFixed(1)}%
                        </div>
                        <div className='h-2 overflow-hidden rounded-full bg-slate-800'>
                          <div
                            className={`h-full rounded-full ${scoreBar(item.latestScore)}`}
                            style={{ width: `${Math.max(4, item.latestScore)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className='px-4 py-4'>
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${riskBadge(item.riskLevel)}`}>
                        {item.riskLevel}
                      </span>
                    </td>
                    <td className='px-4 py-4 text-slate-400'>
                      {new Intl.DateTimeFormat('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      }).format(new Date(item.lastActivity))}
                    </td>
                    <td className='px-4 py-4 text-slate-400'>
                      {item.assessmentCount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <AdminPagination
            currentPage={currentPage}
            totalItems={data.length}
            pageSize={PAGE_SIZE}
            onPageChange={setCurrentPage}
            itemLabel='organizations'
          />
        </>
      ) : (
        <div className='px-6 py-20 text-center text-sm text-slate-500'>
          No organization activity available yet.
        </div>
      )}
    </div>
  );
}
