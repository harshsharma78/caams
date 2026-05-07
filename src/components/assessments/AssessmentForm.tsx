'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState, useTransition } from 'react';

import {
  ASSESSMENT_CATEGORIES,
  calculateWeightedScores,
  getScoreInterpretation,
} from '@/lib/assessmentEngine';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { assessmentInputSchema } from '@/lib/validations';

interface AssessmentFormProps {
  organizations: { id: string; name: string }[];
}

type CategoryResponses = Record<string, Record<string, number | null>>;

function buildInitialResponses() {
  return ASSESSMENT_CATEGORIES.reduce<CategoryResponses>(
    (accumulator, category) => {
      accumulator[category.key] = category.questions.reduce<
        Record<string, number | null>
      >((questionAccumulator, question) => {
        questionAccumulator[question.id] = null;
        return questionAccumulator;
      }, {});

      return accumulator;
    },
    {},
  );
}

export function AssessmentForm({ organizations }: AssessmentFormProps) {
  const router = useRouter();
  const [organizationId, setOrganizationId] = useState('');
  const [responses, setResponses] = useState<CategoryResponses>(
    buildInitialResponses,
  );
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const currentCategory = ASSESSMENT_CATEGORIES[step];
  const isCurrentStepComplete = currentCategory.questions.every(
    (question) => responses[currentCategory.key][question.id],
  );
  const isAssessmentComplete = ASSESSMENT_CATEGORIES.every((category) =>
    category.questions.every(
      (question) => responses[category.key][question.id],
    ),
  );

  const preview = useMemo(() => {
    if (!isAssessmentComplete) {
      return null;
    }

    return calculateWeightedScores(
      ASSESSMENT_CATEGORIES.map((category) => ({
        key: category.key,
        questions: category.questions.map((question) => ({
          id: question.id,
          score: responses[category.key][question.id] ?? 1,
        })),
      })),
    );
  }, [isAssessmentComplete, responses]);

  const progress = ((step + 1) / ASSESSMENT_CATEGORIES.length) * 100;

  return (
    <Card>
      <CardHeader className='space-y-4'>
        <div className='space-y-2'>
          <p className='text-sm font-medium uppercase tracking-[0.18em] text-sky-600 dark:text-sky-400'>
            Step {step + 1} of {ASSESSMENT_CATEGORIES.length}
          </p>
          <div className='h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800'>
            <div
              className='h-full rounded-full bg-sky-500 transition-all'
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <label className='block max-w-md space-y-1.5'>
          <span className='text-sm font-medium text-slate-700 dark:text-slate-200'>
            Organization
          </span>
          <Select
            value={organizationId}
            onValueChange={setOrganizationId}>
            <SelectTrigger>
              <SelectValue placeholder='Select Organization' />
            </SelectTrigger>
            <SelectContent className='border-slate-300 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50'>
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
      </CardHeader>
      <CardContent className='space-y-8'>
        <div className='space-y-2'>
          <h2 className='text-2xl font-semibold text-slate-900 dark:text-slate-50'>
            {currentCategory.name}
          </h2>
          <p className='text-sm text-slate-600 dark:text-slate-300'>
            Weight: {currentCategory.weight}% of the final readiness score.
          </p>
        </div>

        <div className='space-y-5'>
          {currentCategory.questions.map((question, index) => (
            <div
              key={question.id}
              className='rounded-2xl border border-slate-200 p-5 dark:border-slate-800'>
              <p className='text-sm font-medium text-slate-900 dark:text-slate-50'>
                {index + 1}. {question.prompt}
              </p>
              <div className='mt-4 flex flex-wrap gap-3'>
                {[1, 2, 3, 4, 5].map((score) => {
                  const checked =
                    responses[currentCategory.key][question.id] === score;

                  return (
                    <label
                      key={score}
                      className={cn(
                        'flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition',
                        checked
                          ? 'border-sky-500 bg-sky-50 text-sky-700 dark:border-sky-400 dark:bg-sky-950 dark:text-sky-300'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-slate-50',
                      )}>
                      <input
                        type='radio'
                        name={question.id}
                        className='sr-only'
                        checked={checked}
                        onChange={() => {
                          setResponses((currentResponses) => ({
                            ...currentResponses,
                            [currentCategory.key]: {
                              ...currentResponses[currentCategory.key],
                              [question.id]: score,
                            },
                          }));
                          setError('');
                        }}
                      />
                      Score {score}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {step === ASSESSMENT_CATEGORIES.length - 1 ? (
          <div className='rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950'>
            <h3 className='text-lg font-semibold text-slate-900 dark:text-slate-50'>
              Score preview
            </h3>
            {preview ? (
              <div className='mt-4 space-y-4'>
                <div className='flex flex-wrap items-center gap-3'>
                  <span className='text-3xl font-semibold text-slate-900 dark:text-slate-50'>
                    {preview.overallScore.toFixed(1)} / 100
                  </span>
                  <span
                    className={cn(
                      'inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em]',
                      getScoreInterpretation(preview.overallScore)
                        .badgeClassName,
                    )}>
                    {preview.interpretation.label}
                  </span>
                </div>
                <p className='text-sm text-slate-600 dark:text-slate-300'>
                  {preview.recommendation}
                </p>
              </div>
            ) : (
              <p className='mt-4 text-sm text-slate-600 dark:text-slate-300'>
                Complete all questions in this step to preview the final score
                before saving.
              </p>
            )}
          </div>
        ) : null}

        {error ? <p className='text-sm text-rose-600'>{error}</p> : null}

        <div className='flex flex-wrap items-center justify-between gap-3'>
          <Button
            variant='outline'
            type='button'
            disabled={step === 0 || isPending}
            onClick={() => setStep((currentStep) => currentStep - 1)}>
            Previous
          </Button>
          <div className='flex items-center gap-3'>
            {step < ASSESSMENT_CATEGORIES.length - 1 ? (
              <Button
                type='button'
                disabled={isPending}
                onClick={() => {
                  if (!isCurrentStepComplete) {
                    setError(
                      'Score all 5 questions before moving to the next step.',
                    );
                    return;
                  }

                  setError('');
                  setStep((currentStep) => currentStep + 1);
                }}>
                Next category
              </Button>
            ) : (
              <Button
                type='button'
                disabled={isPending}
                onClick={() => {
                  const payload = {
                    orgId: organizationId,
                    categories: ASSESSMENT_CATEGORIES.map((category) => ({
                      key: category.key,
                      questions: category.questions.map((question) => ({
                        id: question.id,
                        score: responses[category.key][question.id] ?? 1,
                      })),
                    })),
                  };

                  const parsed = assessmentInputSchema.safeParse(payload);

                  if (!parsed.success) {
                    const firstIssue = parsed.error.issues[0];
                    setError(firstIssue?.message ?? 'Invalid assessment data.');
                    return;
                  }

                  setError('');

                  startTransition(async () => {
                    const response = await fetch('/api/assessments', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify(parsed.data),
                    });

                    const data = (await response.json()) as {
                      error?: string;
                      assessment?: { id: string };
                    };

                    if (!response.ok || !data.assessment?.id) {
                      setError(data.error ?? 'Unable to save assessment.');
                      toast.error(data.error ?? 'Unable to save assessment.');
                      return;
                    }

                    toast.success('Assessment saved successfully.');
                    router.push(`/assessments/${data.assessment.id}`);
                    router.refresh();
                  });
                }}>
                {isPending ? (
                  <>
                    <Spinner className='h-4 w-4' />
                    Saving...
                  </>
                ) : (
                  'Save assessment'
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
