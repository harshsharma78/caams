'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/Spinner';
import { organizationSchema } from '@/lib/validations';
import type { OrganizationFormValues } from '@/types';

interface OrganizationFormProps {
  mode: 'create' | 'edit';
  organizationId?: string;
  initialValues?: OrganizationFormValues;
}

const defaultValues: OrganizationFormValues = {
  name: '',
  industry: '',
  size: 'startup',
  sector: '',
  address: '',
  contactPerson: '',
  email: '',
  phone: '',
  logoUrl: '',
};

export function OrganizationForm({
  mode,
  organizationId,
  initialValues = defaultValues,
}: OrganizationFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<OrganizationFormValues>(initialValues);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof OrganizationFormValues, string>>
  >({});
  const [uploadError, setUploadError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleChange = <K extends keyof OrganizationFormValues>(
    key: K,
    value: OrganizationFormValues[K],
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

  return (
    <Card>
      <CardContent className='space-y-6'>
        <form
          className='space-y-6'
          onSubmit={(event) => {
            event.preventDefault();
            setError('');

            const parsed = organizationSchema.safeParse(values);

            if (!parsed.success) {
              const nextErrors = parsed.error.flatten().fieldErrors;
              setFieldErrors({
                name: nextErrors.name?.[0],
                industry: nextErrors.industry?.[0],
                size: nextErrors.size?.[0],
                sector: nextErrors.sector?.[0],
                address: nextErrors.address?.[0],
                contactPerson: nextErrors.contactPerson?.[0],
                email: nextErrors.email?.[0],
                phone: nextErrors.phone?.[0],
                logoUrl: nextErrors.logoUrl?.[0],
              });
              return;
            }

            startTransition(async () => {
              const response = await fetch(
                mode === 'create'
                  ? '/api/organizations'
                  : `/api/organizations/${organizationId}`,
                {
                  method: mode === 'create' ? 'POST' : 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(values),
                },
              );

              const data = (await response.json()) as {
                error?: string;
                organization?: { id: string };
              };

              if (!response.ok) {
                setError(data.error ?? 'Unable to save organization.');
                return;
              }

              const targetId = data.organization?.id ?? organizationId;
              router.push(
                targetId ? `/organizations/${targetId}` : '/organizations',
              );
              router.refresh();
            });
          }}>
          <div className='grid gap-5 md:grid-cols-2'>
            <Input
              label='Organization name'
              value={values.name}
              onChange={(event) => handleChange('name', event.target.value)}
              placeholder='Nimbus Health'
              error={fieldErrors.name}
              required
            />
            <Input
              label='Industry'
              value={values.industry}
              onChange={(event) => handleChange('industry', event.target.value)}
              placeholder='Healthcare'
              error={fieldErrors.industry}
              required
            />
            <label className='block space-y-1.5'>
              <span className='text-sm font-medium text-slate-700 dark:text-slate-200'>
                Organization size
              </span>
              <Select
                value={values.size}
                onValueChange={(value) =>
                  handleChange('size', value as OrganizationFormValues['size'])
                }>
                <SelectTrigger>
                  <SelectValue placeholder='Select organization size' />
                </SelectTrigger>
                <SelectContent className='border-slate-300 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50'>
                  <SelectItem value='startup'>Startup</SelectItem>
                  <SelectItem value='sme'>SME</SelectItem>
                  <SelectItem value='enterprise'>Enterprise</SelectItem>
                </SelectContent>
              </Select>
              {fieldErrors.size ? (
                <p className='text-sm text-rose-600'>{fieldErrors.size}</p>
              ) : null}
            </label>
            <Input
              label='Sector'
              value={values.sector}
              onChange={(event) => handleChange('sector', event.target.value)}
              placeholder='Private'
              error={fieldErrors.sector}
              required
            />
            <Input
              label='Contact person'
              value={values.contactPerson}
              onChange={(event) =>
                handleChange('contactPerson', event.target.value)
              }
              placeholder='Aarav Singh'
              error={fieldErrors.contactPerson}
              required
            />
            <Input
              label='Contact email'
              value={values.email}
              onChange={(event) => handleChange('email', event.target.value)}
              placeholder='contact@nimbushealth.com'
              type='email'
              error={fieldErrors.email}
              required
            />
            <Input
              label='Phone number'
              value={values.phone}
              onChange={(event) => handleChange('phone', event.target.value)}
              placeholder='+91 98765 43210'
              error={fieldErrors.phone}
              required
            />
            <Input
              label='Address'
              value={values.address}
              onChange={(event) => handleChange('address', event.target.value)}
              placeholder='Bhopal, Madhya Pradesh'
              error={fieldErrors.address}
              required
            />
          </div>
          <div className='grid gap-5 md:grid-cols-[1fr_220px]'>
            <div className='space-y-3'>
              <Input
                label='Logo URL'
                value={values.logoUrl}
                onChange={(event) =>
                  handleChange('logoUrl', event.target.value)
                }
                placeholder='https://res.cloudinary.com/...'
                error={fieldErrors.logoUrl}
              />
              <label className='block space-y-1.5'>
                <span className='text-sm font-medium text-slate-700 dark:text-slate-200'>
                  Upload logo
                </span>
                <input
                  type='file'
                  accept='image/*'
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
                      setUploadError(data.error ?? 'Unable to upload logo.');
                      return;
                    }

                    handleChange('logoUrl', data.url);
                  }}
                />
                {isUploading ? (
                  <p className='inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400'>
                    <Spinner className='h-4 w-4' />
                    Uploading logo...
                  </p>
                ) : null}
                {uploadError ? (
                  <p className='text-sm text-rose-600'>{uploadError}</p>
                ) : null}
              </label>
            </div>
            <div className='flex items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900'>
              {values.logoUrl ? (
                <Image
                  src={values.logoUrl}
                  alt={`${values.name || 'Organization'} logo`}
                  width={160}
                  height={160}
                  className='h-32 w-32 rounded-2xl object-cover'
                />
              ) : (
                <div className='text-center text-sm text-slate-500 dark:text-slate-400'>
                  Logo preview
                </div>
              )}
            </div>
          </div>
          {error ? <p className='text-sm text-rose-600'>{error}</p> : null}
          <div className='flex flex-col gap-3 sm:flex-row sm:justify-end'>
            <Button
              variant='outline'
              disabled={isPending || isUploading}
              onClick={() =>
                router.push(
                  organizationId
                    ? `/organizations/${organizationId}`
                    : '/organizations',
                )
              }>
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={isPending || isUploading}>
              {isPending
                ? mode === 'create'
                  ? 'Creating...'
                  : 'Saving...'
                : mode === 'create'
                  ? 'Create organization'
                  : 'Save changes'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
