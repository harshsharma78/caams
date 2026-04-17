'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input, Textarea } from '@/components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/Spinner';
import {
  interviewSchema,
  STANDARD_INTERVIEW_QUESTIONS,
} from '@/lib/validations';
import type { InterviewFormValues } from '@/types';

interface Organization {
  id: string;
  name: string;
}

interface InterviewFormProps {
  organizations: Organization[];
}

const defaultValues: InterviewFormValues = {
  orgId: '',
  intervieweeName: '',
  designation: '',
  department: '',
  experience: '',
  responses: STANDARD_INTERVIEW_QUESTIONS.map((question) => ({
    question,
    answer: '',
  })),
  fileUrl: '',
};

export function InterviewForm({ organizations }: InterviewFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<InterviewFormValues>(defaultValues);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof InterviewFormValues, string>>
  >({});
  const [responseErrors, setResponseErrors] = useState<Record<number, string>>(
    {},
  );
  const [uploadError, setUploadError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleChange = <K extends keyof InterviewFormValues>(
    key: K,
    value: InterviewFormValues[K],
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

  const handleResponseChange = (index: number, answer: string) => {
    setValues((currentValues) => {
      const updatedResponses = [...currentValues.responses];
      updatedResponses[index] = { ...updatedResponses[index], answer };
      return { ...currentValues, responses: updatedResponses };
    });
    setResponseErrors((currentErrors) => {
      const updated = { ...currentErrors };
      delete updated[index];
      return updated;
    });
  };

  return (
    <form
      className='space-y-8'
      onSubmit={(event) => {
        event.preventDefault();
        setError('');
        setFieldErrors({});
        setResponseErrors({});

        const parsed = interviewSchema.safeParse(values);

        if (!parsed.success) {
          const flatErrors = parsed.error.flatten();
          setFieldErrors({
            orgId: flatErrors.fieldErrors.orgId?.[0],
            intervieweeName: flatErrors.fieldErrors.intervieweeName?.[0],
            designation: flatErrors.fieldErrors.designation?.[0],
            department: flatErrors.fieldErrors.department?.[0],
            experience: flatErrors.fieldErrors.experience?.[0],
            responses: flatErrors.fieldErrors.responses?.[0],
            fileUrl: flatErrors.fieldErrors.fileUrl?.[0],
          });
          return;
        }

        startTransition(async () => {
          const response = await fetch('/api/interviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(values),
          });

          const data = (await response.json()) as {
            error?: string;
            interview?: { id: string };
          };

          if (!response.ok) {
            setError(data.error ?? 'Unable to save interview.');
            return;
          }

          const targetId = data.interview?.id;
          router.push(targetId ? `/interviews/${targetId}` : '/interviews');
          router.refresh();
        });
      }}>
      {/* Interviewee details */}
      <Card>
        <CardContent className='space-y-6'>
          <h2 className='text-xl font-semibold text-slate-900 dark:text-slate-50'>
            Interviewee details
          </h2>
          <div className='grid gap-5 md:grid-cols-2'>
            <label className='block space-y-1.5'>
              <span className='text-sm font-medium text-slate-700 dark:text-slate-200'>
                Organization
              </span>
              <Select
                value={values.orgId}
                onValueChange={(value) => handleChange('orgId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder='Select organization' />
                </SelectTrigger>
                <SelectContent className='border-slate-300 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50'>
                  {organizations.map((org) => (
                    <SelectItem
                      key={org.id}
                      value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors.orgId ? (
                <p className='text-sm text-rose-600'>{fieldErrors.orgId}</p>
              ) : null}
            </label>
            <Input
              label='Full Name'
              value={values.intervieweeName}
              onChange={(event) =>
                handleChange('intervieweeName', event.target.value)
              }
              placeholder='Enter Full Name'
              error={fieldErrors.intervieweeName}
              required
            />
            <Input
              label='Designation'
              value={values.designation}
              onChange={(event) =>
                handleChange('designation', event.target.value)
              }
              placeholder='Enter Designation'
              error={fieldErrors.designation}
              required
            />
            <Input
              label='Department'
              value={values.department}
              onChange={(event) =>
                handleChange('department', event.target.value)
              }
              placeholder='Enter Department'
              error={fieldErrors.department}
              required
            />
            <Input
              label='Years of experience'
              value={values.experience}
              onChange={(event) =>
                handleChange('experience', event.target.value)
              }
              placeholder='Enter Years of Experience'
              error={fieldErrors.experience}
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Interview questions */}
      <Card>
        <CardContent className='space-y-8'>
          <div className='space-y-1'>
            <h2 className='text-xl font-semibold text-slate-900 dark:text-slate-50'>
              Interview questions
            </h2>
            <p className='text-sm text-slate-500 dark:text-slate-400'>
              Record the interviewee&apos;s responses to each cloud computing
              question below.
            </p>
          </div>
          {fieldErrors.responses ? (
            <p className='text-sm text-rose-600'>{fieldErrors.responses}</p>
          ) : null}
          {values.responses.map((response, index) => (
            <div
              key={index}
              className='space-y-2'>
              <div className='flex items-start gap-3'>
                <span className='mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-xs font-bold text-sky-700 dark:bg-sky-950 dark:text-sky-300'>
                  {index + 1}
                </span>
                <p className='text-sm font-medium leading-relaxed text-slate-800 dark:text-slate-200'>
                  {response.question}
                </p>
              </div>
              <div className='pl-10'>
                <Textarea
                  value={response.answer}
                  onChange={(event) =>
                    handleResponseChange(index, event.target.value)
                  }
                  placeholder='Enter the interviewee&#39;s response...'
                  rows={3}
                  error={responseErrors[index]}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* File attachment */}
      <Card>
        <CardContent className='space-y-6'>
          <div className='space-y-1'>
            <h2 className='text-xl font-semibold text-slate-900 dark:text-slate-50'>
              Attachment
            </h2>
            <p className='text-sm text-slate-500 dark:text-slate-400'>
              Optionally attach a transcript or audio recording of the
              interview.
            </p>
          </div>
          <div className='grid gap-5 md:grid-cols-2'>
            <Input
              label='File / audio URL'
              value={values.fileUrl}
              onChange={(event) => handleChange('fileUrl', event.target.value)}
              placeholder='https://res.cloudinary.com/...'
              error={fieldErrors.fileUrl}
            />
            <label className='block space-y-1.5'>
              <span className='text-sm font-medium text-slate-700 dark:text-slate-200'>
                Upload file
              </span>
              <input
                type='file'
                accept='audio/*,application/pdf,.doc,.docx,.txt'
                className='block w-full rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-600 file:mr-4 file:rounded-md file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white dark:border-slate-700 dark:text-slate-300 dark:file:bg-slate-100 dark:file:text-slate-950'
                disabled={isUploading}
                onChange={async (event) => {
                  const file = event.target.files?.[0];

                  if (!file) {
                    return;
                  }

                  setUploadError('');
                  setIsUploading(true);

                  const formData = new FormData();
                  formData.append('file', file);

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
                    setUploadError(data.error ?? 'Unable to upload file.');
                    return;
                  }

                  handleChange('fileUrl', data.url);
                }}
              />
              {isUploading ? (
                <p className='inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400'>
                  <Spinner className='h-4 w-4' />
                  Uploading file...
                </p>
              ) : null}
              {uploadError ? (
                <p className='text-sm text-rose-600'>{uploadError}</p>
              ) : null}
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      {error ? <p className='text-sm text-rose-600'>{error}</p> : null}
      <div className='flex flex-col gap-3 sm:flex-row sm:justify-end'>
        <Button
          variant='outline'
          disabled={isPending || isUploading}
          onClick={() => router.push('/interviews')}>
          Cancel
        </Button>
        <Button
          type='submit'
          disabled={isPending || isUploading}>
          {isPending ? 'Saving interview...' : 'Save interview'}
        </Button>
      </div>
    </form>
  );
}
