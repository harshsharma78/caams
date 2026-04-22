import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import {
  generateSecurityActionItems,
  getSecurityCategoryBreakdown,
  getSecurityRiskLevel,
} from '@/lib/securityEngine';
import { cn } from '@/lib/utils';
import { auth } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import SecurityCheck from '@/models/SecurityCheck';
import type { SecurityChecklistItem } from '@/types';

export const metadata: Metadata = {
  title: 'CAAMS | Security Assessment Details',
};

export default async function SecurityAssessmentDetailPage({
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

  const assessment = await SecurityCheck.findById(id)
    .populate('orgId', 'name')
    .populate('conductedBy', 'name email role')
    .lean();

  if (
    !assessment ||
    !assessment.orgId ||
    typeof assessment.orgId !== 'object' ||
    !('name' in assessment.orgId)
  ) {
    notFound();
  }

  const groupedChecklist: Record<string, SecurityChecklistItem[]> =
    assessment.checklist.reduce(
      (
        accumulator: Record<string, SecurityChecklistItem[]>,
        item: {
          category: string;
          item: string;
          status: SecurityChecklistItem['status'];
          notes: string;
        },
      ) => {
        if (!accumulator[item.category]) {
          accumulator[item.category] = [];
        }

      accumulator[item.category].push({
        category: item.category,
        item: item.item,
        status: item.status,
        notes: item.notes,
      });

        return accumulator;
      },
      {},
    );

  const normalizedChecklist: SecurityChecklistItem[] = assessment.checklist.map(
    (item: {
      category: string;
      item: string;
      status: SecurityChecklistItem['status'];
      notes: string;
    }) => ({
      category: item.category,
      item: item.item,
      status: item.status,
      notes: item.notes,
    }),
  );
  const categoryBreakdown = getSecurityCategoryBreakdown(normalizedChecklist);
  const actionItems = generateSecurityActionItems(normalizedChecklist);

  const risk = getSecurityRiskLevel(assessment.score);

  return (
    <div className='space-y-8'>
      <PageHeader
        title={assessment.orgId.name}
        description='Security assessment detail with category scoring, findings, and remediation guidance.'
      />

      <div className='grid gap-6 xl:grid-cols-[0.82fr_1.18fr]'>
        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <h2 className='text-xl font-semibold text-slate-900 dark:text-slate-50'>
                Overall risk
              </h2>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex flex-wrap items-center gap-3'>
                <span className='text-4xl font-semibold text-slate-900 dark:text-slate-50'>
                  {assessment.score} / 60
                </span>
                <span
                  className={cn(
                    'inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em]',
                    risk.badgeClassName,
                  )}>
                  {risk.label}
                </span>
              </div>
              <div className='space-y-2 text-sm text-slate-600 dark:text-slate-300'>
                <p>
                  Assessed on{' '}
                  {new Intl.DateTimeFormat('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  }).format(assessment.createdAt)}
                </p>
                <p>
                  Conducted by{' '}
                  {assessment.conductedBy &&
                  typeof assessment.conductedBy === 'object' &&
                  '_id' in assessment.conductedBy
                    ? assessment.conductedBy.name
                    : 'Unknown reviewer'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className='text-xl font-semibold text-slate-900 dark:text-slate-50'>
                Category breakdown
              </h2>
            </CardHeader>
            <CardContent className='space-y-4'>
              {categoryBreakdown.map((category) => (
                <div
                  key={category.category}
                  className='space-y-2'>
                  <div className='flex items-center justify-between gap-3 text-sm'>
                    <span className='font-medium text-slate-900 dark:text-slate-50'>
                      {category.category}
                    </span>
                    <span className='text-slate-600 dark:text-slate-300'>
                      {category.score} / {category.maxScore}
                    </span>
                  </div>
                  <div className='h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800'>
                    <div
                      className='h-full rounded-full bg-sky-500'
                      style={{
                        width: `${(category.score / category.maxScore) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className='text-xl font-semibold text-slate-900 dark:text-slate-50'>
                Action items
              </h2>
            </CardHeader>
            <CardContent className='space-y-3'>
              {actionItems.length ? (
                actionItems.map((item) => (
                  <div
                    key={item}
                    className='rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-950 dark:bg-rose-950/30 dark:text-rose-300'>
                    {item}
                  </div>
                ))
              ) : (
                <p className='text-sm text-slate-500 dark:text-slate-400'>
                  No non-compliant items were identified.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <h2 className='text-xl font-semibold text-slate-900 dark:text-slate-50'>
                Key findings
              </h2>
            </CardHeader>
            <CardContent className='space-y-3'>
              {assessment.findings.length ? (
                assessment.findings.map((finding: string) => (
                  <div
                    key={finding}
                    className='rounded-2xl border border-slate-200 p-4 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300'>
                    {finding}
                  </div>
                ))
              ) : (
                <p className='text-sm text-slate-500 dark:text-slate-400'>
                  No findings generated.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className='text-xl font-semibold text-slate-900 dark:text-slate-50'>
                Recommendations
              </h2>
            </CardHeader>
            <CardContent className='space-y-3'>
              {assessment.recommendations.length ? (
                assessment.recommendations.map((recommendation: string) => (
                  <div
                    key={recommendation}
                    className='rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-950 dark:bg-amber-950/30 dark:text-amber-300'>
                    {recommendation}
                  </div>
                ))
              ) : (
                <p className='text-sm text-slate-500 dark:text-slate-400'>
                  No recommendations generated.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className='text-xl font-semibold text-slate-900 dark:text-slate-50'>
                Checklist detail
              </h2>
            </CardHeader>
            <CardContent className='space-y-6'>
              {Object.entries(groupedChecklist).map(([category, items]) => (
                <div
                  key={category}
                  className='space-y-3'>
                  <h3 className='text-lg font-semibold text-slate-900 dark:text-slate-50'>
                    {category}
                  </h3>
                  <div className='space-y-3'>
                    {items.map((item: SecurityChecklistItem) => (
                      <div
                        key={`${category}-${item.item}`}
                        className='rounded-2xl border border-slate-200 p-4 dark:border-slate-800'>
                        <div className='flex flex-wrap items-start justify-between gap-3'>
                          <p className='text-sm font-medium text-slate-900 dark:text-slate-50'>
                            {item.item}
                          </p>
                          <Badge
                            variant={
                              item.status === 'compliant'
                                ? 'success'
                                : item.status === 'partial'
                                  ? 'warning'
                                  : 'danger'
                            }>
                            {item.status}
                          </Badge>
                        </div>
                        {item.notes ? (
                          <p className='mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300'>
                            {item.notes}
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
