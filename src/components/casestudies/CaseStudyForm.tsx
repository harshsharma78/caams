'use client';

import { useMemo, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import toast from 'react-hot-toast';

import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input, Textarea } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { caseStudySchema, CASE_STUDY_SECTORS } from '@/lib/validations';
import type { CaseStudyFormValues } from '@/types';

const defaultValues: CaseStudyFormValues = {
  title: '',
  orgId: '',
  sector: 'Technology',
  challenge: '',
  solution: '',
  outcome: '',
  results: '',
  tags: [],
  fileUrl: '',
};

function RichTextarea({
  label,
  value,
  error,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  error?: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const insertBlock = (prefix: string, suffix = '') => {
    const textarea = textareaRef.current;

    if (!textarea) {
      onChange(`${value}${prefix}${suffix}`);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end);
    const nextValue =
      value.slice(0, start) +
      prefix +
      selected +
      suffix +
      value.slice(end);

    onChange(nextValue);

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.selectionStart = start + prefix.length;
      textarea.selectionEnd = start + prefix.length + selected.length;
    });
  };

  return (
    <div className='space-y-1.5'>
      <div className='flex items-center justify-between gap-3'>
        <span className='text-sm font-medium text-slate-700 dark:text-slate-200'>
          {label}
        </span>
        <div className='flex flex-wrap gap-2'>
          <button
            type='button'
            className='rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:text-slate-50'
            onClick={() => insertBlock('• ')}>
            Bullet
          </button>
          <button
            type='button'
            className='rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:text-slate-50'
            onClick={() => insertBlock('**', '**')}>
            Bold
          </button>
          <button
            type='button'
            className='rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:text-slate-50'
            onClick={() => insertBlock('1. ')}>
            Numbered
          </button>
        </div>
      </div>
      <Textarea
        ref={textareaRef}
        rows={7}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className='leading-6'
      />
      {error ? <p className='text-sm text-rose-600'>{error}</p> : null}
    </div>
  );
}

interface CaseStudyFormProps {
  mode?: 'create' | 'edit';
  caseStudyId?: string;
  initialValues?: CaseStudyFormValues;
  organizations: { id: string; name: string }[];
}

export function CaseStudyForm({
  mode = 'create',
  caseStudyId,
  initialValues = defaultValues,
  organizations,
}: CaseStudyFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<CaseStudyFormValues>(initialValues);
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof CaseStudyFormValues, string>>
  >({});
  const [uploadError, setUploadError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isPending, startTransition] = useTransition();

  /** Max file size for client-side validation (10 MB) */
  const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

  // Track whether anything has changed from initial values (Task 6)
  const hasChanges = useMemo(() => {
    if (mode === 'create') return true;
    return (Object.keys(initialValues) as (keyof CaseStudyFormValues)[]).some(
      (key) => {
        const current = values[key];
        const initial = initialValues[key];
        if (Array.isArray(current) && Array.isArray(initial)) {
          return JSON.stringify(current) !== JSON.stringify(initial);
        }
        return current !== initial;
      },
    );
  }, [mode, values, initialValues]);

  const handleChange = <K extends keyof CaseStudyFormValues>(
    key: K,
    value: CaseStudyFormValues[K],
  ) => {
    setValues((currentValues) => ({
      ...currentValues,
      [key]: value,
    }));
    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      [key]: '',
    }));
  };

  const addTag = () => {
    const normalizedTag = tagInput.trim().replace(/^#/, '');

    if (!normalizedTag || values.tags.includes(normalizedTag)) {
      setTagInput('');
      return;
    }

    handleChange('tags', [...values.tags, normalizedTag]);
    setTagInput('');
  };

  return (
    <Card>
      <CardContent className='space-y-6'>
        <form
          className='space-y-6'
          onSubmit={(event) => {
            event.preventDefault();
            setError('');

            const parsed = caseStudySchema.safeParse(values);

            if (!parsed.success) {
              const nextErrors = parsed.error.flatten().fieldErrors;
              setFieldErrors({
                title: nextErrors.title?.[0],
                orgId: nextErrors.orgId?.[0],
                sector: nextErrors.sector?.[0],
                challenge: nextErrors.challenge?.[0],
                solution: nextErrors.solution?.[0],
                outcome: nextErrors.outcome?.[0],
                results: nextErrors.results?.[0],
                tags: nextErrors.tags?.[0],
                fileUrl: nextErrors.fileUrl?.[0],
              });
              return;
            }

            startTransition(async () => {
              const response = await fetch(
                mode === 'edit' && caseStudyId
                  ? `/api/casestudies/${caseStudyId}`
                  : '/api/casestudies',
                {
                  method: mode === 'edit' ? 'PUT' : 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(parsed.data),
                },
              );

              const data = (await response.json()) as {
                error?: string;
                caseStudy?: { id: string };
              };

              if (!response.ok || !data.caseStudy?.id) {
                setError(data.error ?? 'Unable to save case study.');
                toast.error(data.error ?? 'Unable to save case study.');
                return;
              }

              toast.success(
                mode === 'edit'
                  ? 'Case study updated successfully.'
                  : 'Case study saved successfully.',
              );
              router.push(`/casestudies/${data.caseStudy.id}`);
              router.refresh();
            });
          }}>
          <div className='grid gap-5 md:grid-cols-2'>
            <Input
              label='Title'
              value={values.title}
              onChange={(event) => handleChange('title', event.target.value)}
              placeholder='Enter Case Study Title'
              error={fieldErrors.title}
            />
            <label className='block space-y-1.5'>
              <span className='text-sm font-medium text-slate-700 dark:text-slate-200'>
                Organization
              </span>
              <Select
                value={values.orgId}
                onValueChange={(value) => handleChange('orgId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder='Select Organization' />
                </SelectTrigger>
                <SelectContent className='border-slate-300 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50'>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors.orgId ? (
                <p className='text-sm text-rose-600'>{fieldErrors.orgId}</p>
              ) : null}
            </label>
            <label className='block space-y-1.5'>
              <span className='text-sm font-medium text-slate-700 dark:text-slate-200'>
                Sector
              </span>
              <Select
                value={values.sector}
                onValueChange={(value) =>
                  handleChange('sector', value as CaseStudyFormValues['sector'])
                }>
                <SelectTrigger>
                  <SelectValue placeholder='Select Sector' />
                </SelectTrigger>
                <SelectContent className='border-slate-300 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50'>
                  {CASE_STUDY_SECTORS.map((sector) => (
                    <SelectItem
                      key={sector}
                      value={sector}>
                      {sector}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors.sector ? (
                <p className='text-sm text-rose-600'>{fieldErrors.sector}</p>
              ) : null}
            </label>
            <Input
              label='Results Summary'
              value={values.results}
              onChange={(event) => handleChange('results', event.target.value)}
              placeholder='Enter Results Summary'
              error={fieldErrors.results}
            />
          </div>

          <RichTextarea
            label='Challenge'
            value={values.challenge}
            onChange={(value) => handleChange('challenge', value)}
            placeholder='Enter Challenge Description'
            error={fieldErrors.challenge}
          />

          <RichTextarea
            label='Solution'
            value={values.solution}
            onChange={(value) => handleChange('solution', value)}
            placeholder='Enter Solution Description'
            error={fieldErrors.solution}
          />

          <RichTextarea
            label='Outcome'
            value={values.outcome}
            onChange={(value) => handleChange('outcome', value)}
            placeholder='Enter Outcome Description'
            error={fieldErrors.outcome}
          />

          <div className='space-y-3'>
            <div className='flex flex-wrap items-end gap-3'>
              <div className='min-w-0 flex-1'>
                <Input
                  label='Tags'
                  value={tagInput}
                  onChange={(event) => setTagInput(event.target.value)}
                  placeholder='Enter Tags'
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ',') {
                      event.preventDefault();
                      addTag();
                    }
                  }}
                  error={fieldErrors.tags}
                />
              </div>
              <Button
                type='button'
                variant='outline'
                onClick={addTag}>
                Add tag
              </Button>
            </div>
            <div className='flex flex-wrap gap-2'>
              {values.tags.length ? (
                values.tags.map((tag) => (
                  <button
                    key={tag}
                    type='button'
                    className='rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600 transition hover:border-rose-300 hover:text-rose-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-rose-700 dark:hover:text-rose-300'
                    onClick={() =>
                      handleChange(
                        'tags',
                        values.tags.filter((currentTag) => currentTag !== tag),
                      )
                    }>
                    #{tag} ×
                  </button>
                ))
              ) : (
                <p className='text-sm text-slate-500 dark:text-slate-400'>
                  No tags added yet.
                </p>
              )}
            </div>
          </div>

          <div className='grid gap-5 md:grid-cols-[1fr_220px]'>
            <div className='space-y-3'>
              <Input
                label='Case Study PDF URL'
                value={values.fileUrl}
                onChange={(event) => handleChange('fileUrl', event.target.value)}
                placeholder='Enter File URL'
                error={fieldErrors.fileUrl}
              />
              <label className='block space-y-1.5'>
                <span className='text-sm font-medium text-slate-700 dark:text-slate-200'>
                  Upload PDF
                </span>
                <input
                  type='file'
                  accept='application/pdf'
                  className='block w-full rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-600 file:mr-4 file:rounded-md file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white dark:border-slate-700 dark:text-slate-300 dark:file:bg-slate-100 dark:file:text-slate-950'
                  disabled={isUploading}
                  onChange={async (event) => {
                    const file = event.target.files?.[0];

                    if (!file) {
                      return;
                    }

                    if (file.size > MAX_FILE_SIZE_BYTES) {
                      setUploadError('File size must not exceed 10 MB.');
                      return;
                    }

                    if (file.type !== 'application/pdf') {
                      setUploadError('Only PDF files are allowed.');
                      return;
                    }

                    setUploadError('');
                    setIsUploading(true);

                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('folder', 'caams/case-studies');

                    const response = await fetch('/api/uploads/cloudinary', {
                      method: 'POST',
                      body: formData,
                    });

                    const data = (await response.json()) as {
                      error?: string;
                      url?: string;
                    };

                    setIsUploading(false);

                    if (!response.ok || !data.url) {
                      setUploadError(data.error ?? 'Unable to upload PDF.');
                      return;
                    }

                    handleChange('fileUrl', data.url);
                  }}
                />
                {isUploading ? (
                  <p className='inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400'>
                    <Spinner className='h-4 w-4' />
                    Uploading PDF...
                  </p>
                ) : null}
                {uploadError ? (
                  <p className='text-sm text-rose-600'>{uploadError}</p>
                ) : null}
              </label>
            </div>
            <div className='flex items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400'>
              {values.fileUrl ? 'PDF attached and ready' : 'Upload a supporting PDF'}
            </div>
          </div>

          {error ? <p className='text-sm text-rose-600'>{error}</p> : null}

          <div className='flex flex-col gap-3 sm:flex-row sm:justify-end'>
            <Button
              type='button'
              variant='outline'
              disabled={isPending || isUploading}
              onClick={() => router.push('/casestudies')}>
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={isPending || isUploading || !hasChanges}>
              {isPending
                ? mode === 'edit'
                  ? 'Updating...'
                  : 'Saving...'
                : mode === 'edit'
                  ? 'Update case study'
                  : 'Create case study'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
