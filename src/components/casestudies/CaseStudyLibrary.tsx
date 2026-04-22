'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import { BookOpen, Search } from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DeleteCaseStudyButton } from '@/components/casestudies/DeleteCaseStudyButton';
import { Card, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CASE_STUDY_SECTORS } from '@/lib/validations';
import type { CaseStudyListItem } from '@/types';

interface CaseStudyLibraryProps {
  caseStudies: CaseStudyListItem[];
  canManage?: boolean;
}

export function CaseStudyLibrary({
  caseStudies,
  canManage = false,
}: CaseStudyLibraryProps) {
  const [search, setSearch] = useState('');
  const [sector, setSector] = useState('all');

  const filteredCaseStudies = useMemo(() => {
    const query = search.trim().toLowerCase();

    return caseStudies.filter((caseStudy) => {
      const matchesSearch =
        !query ||
        caseStudy.title.toLowerCase().includes(query) ||
        caseStudy.organization.toLowerCase().includes(query);
      const matchesSector = sector === 'all' || caseStudy.sector === sector;

      return matchesSearch && matchesSector;
    });
  }, [caseStudies, search, sector]);

  return (
    <div className='space-y-6'>
      <Card>
        <CardContent className='grid gap-4 md:grid-cols-[1.6fr_0.8fr]'>
          <Input
            label='Search'
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder='Search by title or organization'
          />
          <label className='block space-y-1.5'>
            <span className='text-sm font-medium text-slate-700 dark:text-slate-200'>
              Sector
            </span>
            <Select
              value={sector}
              onValueChange={setSector}>
              <SelectTrigger>
                <SelectValue placeholder='Filter by sector' />
              </SelectTrigger>
              <SelectContent className='border-slate-300 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50'>
                <SelectItem value='all'>All sectors</SelectItem>
                {CASE_STUDY_SECTORS.map((option) => (
                  <SelectItem
                    key={option}
                    value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
        </CardContent>
      </Card>

      <div className='grid gap-5 md:grid-cols-2 xl:grid-cols-3'>
        {filteredCaseStudies.map((caseStudy) => (
          <Card
            key={caseStudy.id}
            className='overflow-hidden'>
            <CardContent className='flex h-full flex-col gap-5'>
              <div className='space-y-3'>
                <div className='flex flex-wrap items-center gap-2'>
                  <Badge>{caseStudy.sector}</Badge>
                  <span className='text-xs uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400'>
                    {new Intl.DateTimeFormat('en-IN', {
                      dateStyle: 'medium',
                    }).format(new Date(caseStudy.createdAt))}
                  </span>
                </div>
                <div>
                  <h2 className='text-xl font-semibold text-slate-900 dark:text-slate-50'>
                    {caseStudy.title}
                  </h2>
                  <p className='mt-1 text-sm text-slate-600 dark:text-slate-300'>
                    {caseStudy.organization}
                  </p>
                </div>
                <p className='text-sm leading-6 wrap-break-word text-slate-600 dark:text-slate-300'>
                  {caseStudy.outcome.length > 180
                    ? `${caseStudy.outcome.slice(0, 180)}...`
                    : caseStudy.outcome}
                </p>
              </div>

              <div className='flex flex-wrap gap-2'>
                {caseStudy.tags.length ? (
                  caseStudy.tags.map((tag) => (
                    <Badge
                      key={`${caseStudy.id}-${tag}`}
                      variant='outline'
                      className='border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300'>
                      #{tag}
                    </Badge>
                  ))
                ) : (
                  <span className='text-sm text-slate-500 dark:text-slate-400'>
                    No tags added
                  </span>
                )}
              </div>

              <div className='mt-auto flex items-center justify-between gap-3'>
                <div className='text-sm text-slate-500 dark:text-slate-400'>
                  {caseStudy.fileUrl ? 'PDF attached' : 'No file attached'}
                </div>
                <div className='flex items-center gap-3'>
                  {canManage ? (
                    <>
                      <Link
                        href={`/casestudies/${caseStudy.id}/edit`}
                        className='text-sm font-medium text-sky-600 transition hover:text-sky-700'>
                        Edit
                      </Link>
                      <DeleteCaseStudyButton
                        id={caseStudy.id}
                        title={caseStudy.title}
                      />
                    </>
                  ) : null}
                  <Button asChild>
                    <Link href={`/casestudies/${caseStudy.id}`}>View case study</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!filteredCaseStudies.length ? (
        caseStudies.length === 0 ? (
          <EmptyState
            icon={<BookOpen className="h-8 w-8" />}
            title="No case studies"
            description="Get started by creating your first case study."
            actionLabel="Add your first Case Study"
            actionHref="/casestudies/new"
          />
        ) : (
          <EmptyState
            icon={<Search className="h-8 w-8" />}
            title="No matches found"
            description="No case studies match the current search and filter combination."
            actionLabel="Clear filters"
            onAction={() => {
              setSearch('');
              setSector('all');
            }}
          />
        )
      ) : null}
    </div>
  );
}
