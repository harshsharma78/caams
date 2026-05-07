'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';

import { CalendarIcon } from 'lucide-react';
import { format, isValid, parseISO } from 'date-fns';

import { Button } from '@/components/ui/Button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/Card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface Organization {
  id: string;
  name: string;
}

interface InterviewFiltersProps {
  organizations: Organization[];
  currentOrgId?: string;
  currentDateFrom?: string;
  currentDateTo?: string;
}

export function InterviewFilters({
  organizations,
  currentOrgId,
  currentDateFrom,
  currentDateTo,
}: InterviewFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isFromOpen, setIsFromOpen] = useState(false);
  const [isToOpen, setIsToOpen] = useState(false);

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value && value !== 'all') {
        params.set(key, value);
      } else {
        params.delete(key);
      }

      router.push(`/interviews?${params.toString()}`);
    },
    [router, searchParams],
  );

  const clearFilters = useCallback(() => {
    router.push('/interviews');
  }, [router]);

  const parsedDateFrom = currentDateFrom
    ? parseISO(currentDateFrom)
    : undefined;
  const isDateFromValid = parsedDateFrom && isValid(parsedDateFrom);

  const parsedDateTo = currentDateTo ? parseISO(currentDateTo) : undefined;
  const isDateToValid = parsedDateTo && isValid(parsedDateTo);

  const hasFilters = currentOrgId || isDateFromValid || isDateToValid;

  return (
    <Card>
      <CardContent className='py-4'>
        <div className='flex flex-col gap-4 md:flex-row md:items-end'>
          <label className='block min-w-50 space-y-1.5'>
            <span className='text-sm font-medium text-slate-700 dark:text-slate-200'>
              Organization
            </span>
            <Select
              value={currentOrgId || 'all'}
              onValueChange={(value) => updateFilter('orgId', value)}>
              <SelectTrigger>
                <SelectValue placeholder='Select Organization' />
              </SelectTrigger>
              <SelectContent className='border-slate-300 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50'>
                <SelectItem value='all'>All organizations</SelectItem>
                {organizations.map((org) => (
                  <SelectItem
                    key={org.id}
                    value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          <label className='block min-w-50 space-y-1.5'>
            <span className='text-sm font-medium text-slate-700 dark:text-slate-200'>
              Start date
            </span>
            <Popover
              open={isFromOpen}
              onOpenChange={setIsFromOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className={cn(
                    'flex h-10 w-full cursor-text items-center justify-start rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-left font-normal dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50',
                    !isDateFromValid && 'text-slate-500',
                  )}>
                  <CalendarIcon className='mr-2 h-4 w-4 opacity-50' />
                  <span>
                    {isDateFromValid
                      ? format(parsedDateFrom, 'PP')
                      : 'Enter Start Date'}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className='w-auto p-0 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950'
                align='start'>
                <Calendar
                  mode='single'
                  className='w-50 max-w-50'
                  selected={isDateFromValid ? parsedDateFrom : undefined}
                  onSelect={(date) => {
                    updateFilter(
                      'dateFrom',
                      date ? format(date, 'yyyy-MM-dd') : '',
                    );
                    setIsFromOpen(false);
                  }}
                  autoFocus
                />
              </PopoverContent>
            </Popover>
          </label>
          <label className='block min-w-50 space-y-1.5'>
            <span className='text-sm font-medium text-slate-700 dark:text-slate-200'>
              End date
            </span>
            <Popover
              open={isToOpen}
              onOpenChange={setIsToOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className={cn(
                    'flex h-10 w-full cursor-text items-center justify-start rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-left font-normal dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50',
                    !isDateToValid && 'text-slate-500',
                  )}>
                  <CalendarIcon className='mr-2 h-4 w-4 opacity-50' />
                  <span>
                    {isDateToValid
                      ? format(parsedDateTo, 'PP')
                      : 'Enter End Date'}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className='w-auto p-0 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950'
                align='start'>
                <Calendar
                  mode='single'
                  className='w-50 max-w-50'
                  selected={isDateToValid ? parsedDateTo : undefined}
                  onSelect={(date) => {
                    updateFilter(
                      'dateTo',
                      date ? format(date, 'yyyy-MM-dd') : '',
                    );
                    setIsToOpen(false);
                  }}
                  autoFocus
                />
              </PopoverContent>
            </Popover>
          </label>
          {hasFilters ? (
            <Button
              variant='outline'
              onClick={clearFilters}>
              Clear
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
