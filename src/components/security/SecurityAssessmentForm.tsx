'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  buildDefaultSecurityChecklist,
  calculateSecurityScore,
  getSecurityRiskLevel,
} from '@/lib/securityEngine';
import { securityAssessmentSchema } from '@/lib/validations';
import { cn } from '@/lib/utils';
import type { SecurityChecklistItem } from '@/types';

interface SecurityAssessmentFormProps {
  organizations: { id: string; name: string }[];
}

const statusOptions: Array<{
  value: SecurityChecklistItem['status'];
  label: string;
}> = [
  { value: 'compliant', label: 'Compliant' },
  { value: 'partial', label: 'Partial' },
  { value: 'non-compliant', label: 'Non-Compliant' },
];

export function SecurityAssessmentForm({
  organizations,
}: SecurityAssessmentFormProps) {
  const router = useRouter();
  const [orgId, setOrgId] = useState(organizations[0]?.id ?? '');
  const [checklist, setChecklist] = useState(buildDefaultSecurityChecklist);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  const groupedChecklist = useMemo(() => {
    return checklist.reduce<Record<string, SecurityChecklistItem[]>>(
      (accumulator, item) => {
        if (!accumulator[item.category]) {
          accumulator[item.category] = [];
        }

        accumulator[item.category].push(item);
        return accumulator;
      },
      {},
    );
  }, [checklist]);

  const score = calculateSecurityScore(checklist);
  const risk = getSecurityRiskLevel(score);

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader className='space-y-4'>
          <label className='block max-w-md space-y-1.5'>
            <span className='text-sm font-medium text-slate-700 dark:text-slate-200'>
              Organization
            </span>
            <Select
              value={orgId}
              onValueChange={setOrgId}>
              <SelectTrigger>
                <SelectValue placeholder='Select organization' />
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
            {fieldErrors.orgId ? (
              <p className='text-sm text-rose-600'>{fieldErrors.orgId}</p>
            ) : null}
          </label>
        </CardHeader>
      </Card>

      {Object.entries(groupedChecklist).map(([category, items]) => (
        <Card key={category}>
          <CardHeader>
            <h2 className='text-xl font-semibold text-slate-900 dark:text-slate-50'>
              {category}
            </h2>
          </CardHeader>
          <CardContent className='space-y-5'>
            {items.map((item) => {
              const globalIndex = checklist.findIndex(
                (entry) =>
                  entry.category === item.category && entry.item === item.item,
              );

              return (
                <div
                  key={`${item.category}-${item.item}`}
                  className='rounded-2xl border border-slate-200 p-5 dark:border-slate-800'>
                  <p className='text-sm font-medium text-slate-900 dark:text-slate-50'>
                    {globalIndex + 1}. {item.item}
                  </p>
                  <div className='mt-4 flex flex-wrap gap-3'>
                    {statusOptions.map((option) => {
                      const checked = item.status === option.value;

                      return (
                        <label
                          key={option.value}
                          className={cn(
                            'flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition',
                            checked
                              ? 'border-sky-500 bg-sky-50 text-sky-700 dark:border-sky-400 dark:bg-sky-950 dark:text-sky-300'
                              : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-slate-50',
                          )}>
                          <input
                            type='radio'
                            className='sr-only'
                            name={`${item.category}-${globalIndex}`}
                            checked={checked}
                            onChange={() =>
                              setChecklist((currentChecklist) =>
                                currentChecklist.map((entry, index) =>
                                  index === globalIndex
                                    ? { ...entry, status: option.value }
                                    : entry,
                                ),
                              )
                            }
                          />
                          {option.label}
                        </label>
                      );
                    })}
                  </div>
                  <div className='mt-4'>
                    <Textarea
                      label='Notes'
                      rows={3}
                      value={item.notes}
                      error={fieldErrors[`checklist.${globalIndex}.notes`]}
                      onChange={(event) => {
                        setChecklist((currentChecklist) =>
                          currentChecklist.map((entry, index) =>
                            index === globalIndex
                              ? { ...entry, notes: event.target.value }
                              : entry,
                          ),
                        );
                        setFieldErrors((prev) => ({
                          ...prev,
                          [`checklist.${globalIndex}.notes`]: '',
                        }));
                      }}
                      placeholder='Document evidence, gaps, or context for this control.'
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardContent className='flex flex-col gap-6 md:flex-row md:items-center md:justify-between'>
          <div className='space-y-2'>
            <p className='text-sm font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400'>
              Live score
            </p>
            <div className='flex flex-wrap items-center gap-3'>
              <span className='text-4xl font-semibold text-slate-900 dark:text-slate-50'>
                {score} / 60
              </span>
              <span
                className={cn(
                  'inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em]',
                  risk.badgeClassName,
                )}>
                {risk.label}
              </span>
            </div>
          </div>
          <div className='flex flex-col gap-3 sm:flex-row'>
            <Button
              type='button'
              variant='outline'
              disabled={isPending}
              onClick={() => router.push('/security')}>
              Cancel
            </Button>
            <Button
              type='button'
              disabled={isPending}
              onClick={() => {
                const payload = { orgId, checklist };
                const parsed = securityAssessmentSchema.safeParse(payload);

                if (!parsed.success) {
                  const newErrors: Record<string, string> = {};
                  parsed.error.issues.forEach((issue) => {
                    const path = issue.path.join('.');
                    if (!newErrors[path]) {
                      newErrors[path] = issue.message;
                    }
                  });
                  setFieldErrors(newErrors);
                  setError('Please correct the highlighted errors.');
                  return;
                }

                setFieldErrors({});
                setError('');

                startTransition(async () => {
                  const response = await fetch('/api/security', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(parsed.data),
                  });

                  const data = (await response.json()) as {
                    error?: string;
                    securityAssessment?: { id: string };
                  };

                  if (!response.ok || !data.securityAssessment?.id) {
                    setError(
                      data.error ?? 'Unable to save security assessment.',
                    );
                    toast.error(
                      data.error ?? 'Unable to save security assessment.',
                    );
                    return;
                  }

                  toast.success('Security assessment saved successfully.');
                  router.push(`/security/${data.securityAssessment.id}`);
                  router.refresh();
                });
              }}>
              {isPending ? 'Saving...' : 'Save assessment'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error ? <p className='text-sm text-rose-600'>{error}</p> : null}
    </div>
  );
}
