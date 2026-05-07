'use client';

import { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/Button';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  /** Label used in the "Showing X of N {itemLabel}" text */
  itemLabel?: string;
}

export function Pagination({
  currentPage,
  totalItems,
  pageSize = 10,
  onPageChange,
  itemLabel = 'items',
}: PaginationProps) {
  const pageCount = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  const pages = useMemo(
    () => Array.from({ length: pageCount }, (_, index) => index + 1),
    [pageCount],
  );

  if (totalItems <= pageSize) {
    return null;
  }

  return (
    <div className='flex flex-col gap-4 border-t border-slate-200 px-6 py-4 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400 md:flex-row md:items-center md:justify-between'>
      <span>
        Showing {startIndex + 1}–{endIndex} of {totalItems} {itemLabel}
      </span>
      <div className='flex flex-wrap items-center gap-2'>
        <Button
          type='button'
          variant='outline'
          size='sm'
          disabled={currentPage === 1}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}>
          <ChevronLeft className='h-4 w-4' />
          Previous
        </Button>
        <div className='flex flex-wrap items-center gap-1'>
          {pages.map((page) => (
            <Button
              key={page}
              type='button'
              variant={page === currentPage ? 'secondary' : 'outline'}
              size='sm'
              onClick={() => onPageChange(page)}>
              {page}
            </Button>
          ))}
        </div>
        <Button
          type='button'
          variant='outline'
          size='sm'
          disabled={currentPage === pageCount}
          onClick={() => onPageChange(Math.min(pageCount, currentPage + 1))}>
          Next
          <ChevronRight className='h-4 w-4' />
        </Button>
      </div>
    </div>
  );
}

/** Admin-styled pagination for dark-themed tables */
export function AdminPagination({
  currentPage,
  totalItems,
  pageSize = 10,
  onPageChange,
  itemLabel = 'items',
}: PaginationProps) {
  const pageCount = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  const pages = useMemo(
    () => Array.from({ length: pageCount }, (_, index) => index + 1),
    [pageCount],
  );

  if (totalItems <= pageSize) {
    return null;
  }

  return (
    <div className='flex flex-col gap-4 border-t border-slate-800 px-6 py-4 text-sm text-slate-400 md:flex-row md:items-center md:justify-between'>
      <span>
        Showing {startIndex + 1}–{endIndex} of {totalItems} {itemLabel}
      </span>
      <div className='flex flex-wrap items-center gap-2'>
        <Button
          type='button'
          variant='outline'
          size='sm'
          disabled={currentPage === 1}
          className='border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800'
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}>
          <ChevronLeft className='h-4 w-4' />
          Previous
        </Button>
        <div className='flex flex-wrap items-center gap-1'>
          {pages.map((page) => (
            <Button
              key={page}
              type='button'
              variant={page === currentPage ? 'secondary' : 'outline'}
              size='sm'
              className={
                page === currentPage
                  ? 'bg-slate-100 text-slate-950 hover:bg-white'
                  : 'border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800'
              }
              onClick={() => onPageChange(page)}>
              {page}
            </Button>
          ))}
        </div>
        <Button
          type='button'
          variant='outline'
          size='sm'
          disabled={currentPage === pageCount}
          className='border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800'
          onClick={() => onPageChange(Math.min(pageCount, currentPage + 1))}>
          Next
          <ChevronRight className='h-4 w-4' />
        </Button>
      </div>
    </div>
  );
}
