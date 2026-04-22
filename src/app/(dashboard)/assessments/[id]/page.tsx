import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { AssessmentActions } from '@/components/assessments/AssessmentActions';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { getScoreInterpretation } from '@/lib/assessmentEngine';
import { auth } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import Assessment from '@/models/Assessment';
import type { AssessmentCategoryScore } from '@/types';

export const metadata: Metadata = {
  title: 'CAAMS | Assessment Details',
};

export default async function AssessmentDetailPage({
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

  const assessment = await Assessment.findById(id)
    .populate('orgId', 'name')
    .populate('assessorId', 'name email role')
    .lean();

  if (
    !assessment ||
    !assessment.orgId ||
    typeof assessment.orgId !== 'object' ||
    !('name' in assessment.orgId)
  ) {
    notFound();
  }

  const interpretation = getScoreInterpretation(assessment.overallScore);
  const exportPayload = JSON.stringify(
    {
      id: assessment._id.toString(),
      organization: {
        id: assessment.orgId._id.toString(),
        name: assessment.orgId.name,
      },
      overallScore: assessment.overallScore,
      status: interpretation.label,
      recommendation: assessment.recommendation,
      categories: assessment.categories,
      createdAt: assessment.createdAt,
      assessor:
        assessment.assessorId &&
        typeof assessment.assessorId === 'object' &&
        '_id' in assessment.assessorId
          ? {
              id: assessment.assessorId._id.toString(),
              name: assessment.assessorId.name,
              email: assessment.assessorId.email,
              role: assessment.assessorId.role,
            }
          : null,
    },
    null,
    2,
  );

  return (
    <div className='space-y-8'>
      <PageHeader
        title={assessment.orgId.name}
        description='Cloud readiness assessment result with weighted scoring, category detail, and generated recommendations.'
        action={
          <AssessmentActions
            fileName={`assessment-${assessment._id.toString()}.json`}
            exportPayload={exportPayload}
          />
        }
      />

      <div className='grid gap-6 xl:grid-cols-[0.72fr_1.28fr]'>
        <Card>
          <CardHeader>
            <h2 className='text-xl font-semibold text-slate-900 dark:text-slate-50'>
              Overall result
            </h2>
          </CardHeader>
          <CardContent className='space-y-5'>
            <div className='space-y-2'>
              <p className='text-4xl font-semibold text-slate-900 dark:text-slate-50'>
                {assessment.overallScore.toFixed(1)} / 100
              </p>
              <span
                className={cn(
                  'inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em]',
                  interpretation.badgeClassName,
                )}>
                {interpretation.label}
              </span>
            </div>
            <div className='space-y-3 text-sm text-slate-600 dark:text-slate-300'>
              <p>
                Assessed on{' '}
                {new Intl.DateTimeFormat('en-IN', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                }).format(assessment.createdAt)}
              </p>
              {assessment.assessorId &&
              typeof assessment.assessorId === 'object' &&
              '_id' in assessment.assessorId ? (
                <p>Assessor: {assessment.assessorId.name}</p>
              ) : null}
            </div>
            <div className='rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950'>
              <p className='text-sm font-medium text-slate-900 dark:text-slate-50'>
                Recommendation
              </p>
              <p className='mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300'>
                {assessment.recommendation}
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
          <CardContent className='space-y-6'>
            {(assessment.categories as AssessmentCategoryScore[]).map(
              (category) => {
                const categoryInterpretation = getScoreInterpretation(
                  category.percentageScore,
                );

                return (
                  <div
                    key={category.key}
                    className='space-y-3'>
                    <div className='flex flex-col justify-between gap-3 md:flex-row md:items-center'>
                      <div>
                        <p className='font-medium text-slate-900 dark:text-slate-50'>
                          {category.name}
                        </p>
                        <p className='text-sm text-slate-500 dark:text-slate-400'>
                          Weight {category.weight}% · Average{' '}
                          {category.averageScore.toFixed(1)} / 5
                        </p>
                      </div>
                      <div className='text-sm font-medium text-slate-700 dark:text-slate-200'>
                        {category.weightedScore.toFixed(1)} points
                      </div>
                    </div>
                    <div className='h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800'>
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          categoryInterpretation.color,
                        )}
                        style={{ width: `${category.percentageScore}%` }}
                      />
                    </div>
                    <div className='grid gap-3 md:grid-cols-2'>
                      {category.questions.map((question) => (
                        <div
                          key={question.id}
                          className='rounded-2xl border border-slate-200 p-4 dark:border-slate-800'>
                          <p className='text-sm text-slate-600 dark:text-slate-300'>
                            {question.prompt}
                          </p>
                          <p className='mt-2 text-sm font-semibold text-slate-900 dark:text-slate-50'>
                            Score: {question.score} / 5
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              },
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
