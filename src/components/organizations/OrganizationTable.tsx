'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import { Pencil } from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DeleteOrganizationButton } from '@/components/forms/DeleteOrganizationButton';
import { Pagination } from '@/components/ui/Pagination';

const PAGE_SIZE = 10;

interface OrganizationRow {
  id: string;
  name: string;
  sector: string;
  industry: string;
  size: string;
  createdAt: string;
  assessmentCount: number;
}

interface OrganizationTableProps {
  organizations: OrganizationRow[];
  canManage: boolean;
}

export function OrganizationTable({
  organizations,
  canManage,
}: OrganizationTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalItems = organizations.length;
  const pageCount = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const safePage = Math.min(currentPage, pageCount);

  const pagedOrganizations = useMemo(
    () =>
      organizations.slice(
        (safePage - 1) * PAGE_SIZE,
        safePage * PAGE_SIZE,
      ),
    [organizations, safePage],
  );

  return (
    <>
      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-slate-200 dark:divide-slate-800'>
          <thead className='bg-slate-50 dark:bg-slate-950'>
            <tr className='text-left text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400'>
              <th className='px-6 py-4'>Name</th>
              <th className='px-6 py-4'>Industry</th>
              <th className='px-6 py-4'>Size</th>
              <th className='px-6 py-4'>Created</th>
              <th className='px-6 py-4'>Assessments</th>
              <th className='px-6 py-4'>Actions</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-slate-200 text-sm dark:divide-slate-800'>
            {pagedOrganizations.length ? (
              pagedOrganizations.map((organization) => (
                <tr key={organization.id}>
                  <td className='px-6 py-4'>
                    <div className='space-y-1'>
                      <Link
                        href={`/organizations/${organization.id}`}
                        className='font-medium text-slate-900 hover:text-sky-600 dark:text-slate-50'>
                        {organization.name}
                      </Link>
                      <p className='text-slate-500 dark:text-slate-400'>
                        {organization.sector}
                      </p>
                    </div>
                  </td>
                  <td className='px-6 py-4 text-slate-600 dark:text-slate-300'>
                    {organization.industry}
                  </td>
                  <td className='px-6 py-4'>
                    <Badge>{organization.size}</Badge>
                  </td>
                  <td className='px-6 py-4 text-slate-600 dark:text-slate-300'>
                    {new Intl.DateTimeFormat('en-IN', {
                      dateStyle: 'medium',
                    }).format(new Date(organization.createdAt))}
                  </td>
                  <td className='px-6 py-4 text-slate-600 dark:text-slate-300'>
                    {organization.assessmentCount}
                  </td>
                  <td className='px-6 py-4'>
                    <div className='flex items-center gap-2'>
                      <Button asChild variant='outline' size='sm'>
                        <Link href={`/organizations/${organization.id}`}>
                          View
                        </Link>
                      </Button>
                      {canManage ? (
                        <>
                          <Button asChild variant='outline' size='sm'>
                            <Link href={`/organizations/${organization.id}/edit`}>
                              <Pencil className='h-3.5 w-3.5' />
                              Edit
                            </Link>
                          </Button>
                          <DeleteOrganizationButton
                            id={organization.id}
                            name={organization.name}
                          />
                        </>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className='px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400'
                  colSpan={6}>
                  No organizations have been created yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {totalItems > PAGE_SIZE && (
        <Pagination
          currentPage={safePage}
          totalItems={totalItems}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
          itemLabel='organizations'
        />
      )}
    </>
  );
}
