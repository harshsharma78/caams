'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import type { AdminUserTableItem } from '@/types/admin-dashboard';
import { Button } from '@/components/ui/Button';
import { roleBadge, statusBadge } from '@/components/admin/utils';

const USERS_PAGE_SIZE = 25;

export function UserManagementTable({
  users,
  currentUserId,
}: {
  users: AdminUserTableItem[];
  currentUserId: string;
}) {
  const [rows, setRows] = useState(users);
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingId, startTransition] = useTransition();

  const pageCount = Math.max(1, Math.ceil(rows.length / USERS_PAGE_SIZE));
  const pageStartIndex = (currentPage - 1) * USERS_PAGE_SIZE;
  const indexedRows = useMemo(
    () => rows.slice(pageStartIndex, pageStartIndex + USERS_PAGE_SIZE),
    [rows, pageStartIndex],
  );
  const paginationPages = useMemo(
    () => Array.from({ length: pageCount }, (_, index) => index + 1),
    [pageCount],
  );

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, pageCount));
  }, [pageCount]);

  const updateUser = (id: string, payload: Record<string, string>) => {
    startTransition(async () => {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        user?: { role?: string; status?: string };
      };

      if (!response.ok) {
        toast.error(data.error ?? 'Unable to update user.');
        return;
      }

      setRows((current) =>
        current.map((row) =>
          row.id === id
            ? {
                ...row,
                role: data.user?.role ?? row.role,
                status: data.user?.status ?? row.status,
              }
            : row,
        ),
      );
      toast.success('User updated.');
    });
  };

  return (
    <div className='rounded-xl border border-slate-700/60 bg-[#1A1D27] shadow-sm'>
      <div className='border-b border-slate-800 px-6 py-5'>
        <h3 className='text-lg font-semibold text-slate-100'>
          User Management
        </h3>
        <p className='text-sm text-slate-400'>
          Platform-wide access control and moderation overview.
        </p>
      </div>
      {indexedRows.length ? (
        <>
          <div className='overflow-x-auto'>
            <table className='min-w-full'>
              <thead className='bg-slate-800/60 text-xs uppercase tracking-wide text-slate-400'>
                <tr>
                  <th className='px-4 py-3 text-left'>#</th>
                  <th className='px-4 py-3 text-left'>Name</th>
                  <th className='px-4 py-3 text-left'>Email</th>
                  <th className='px-4 py-3 text-left'>Role</th>
                  <th className='px-4 py-3 text-left'>Status</th>
                  <th className='px-4 py-3 text-left'>Last Login</th>
                  <th className='px-4 py-3 text-left'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {indexedRows.map((user, index) => {
                  const isSelf = user.id === currentUserId;
                  return (
                    <tr
                      key={user.id}
                      className={`border-t border-slate-800 text-sm transition-colors hover:bg-slate-800/40 ${
                        index % 2 === 0 ? 'bg-slate-900/20' : ''
                      }`}>
                      <td className='px-4 py-4 text-slate-400'>
                        {pageStartIndex + index + 1}
                      </td>
                      <td className='px-4 py-4 text-slate-200'>
                        {user.name}
                        {isSelf ? (
                          <span className='ml-2 text-xs text-slate-500'>
                            (you)
                          </span>
                        ) : null}
                      </td>
                      <td className='px-4 py-4 text-slate-400'>{user.email}</td>
                      <td className='px-4 py-4'>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${roleBadge(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className='px-4 py-4'>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadge(user.status)}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className='px-4 py-4 text-slate-400'>
                        {user.lastLoginAt
                          ? new Intl.DateTimeFormat('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                            }).format(new Date(user.lastLoginAt))
                          : 'Never'}
                      </td>
                      <td className='px-4 py-4'>
                        <div className='flex flex-wrap items-center gap-3 text-xs'>
                          <button
                            type='button'
                            disabled={pendingId || isSelf}
                            className='text-red-400 transition hover:text-red-300 disabled:opacity-40'
                            onClick={() =>
                              updateUser(user.id, {
                                status:
                                  user.status === 'suspended'
                                    ? 'active'
                                    : 'suspended',
                              })
                            }>
                            {user.status === 'suspended'
                              ? 'Activate'
                              : 'Suspend'}
                          </button>
                          <button
                            type='button'
                            disabled={
                              pendingId || isSelf || user.role === 'admin'
                            }
                            className='text-blue-400 transition hover:text-blue-300 disabled:opacity-40'
                            onClick={() =>
                              updateUser(user.id, { role: 'admin' })
                            }>
                            Promote
                          </button>
                          <Link
                            href='#audit-log'
                            className='text-slate-400 transition hover:text-slate-300'>
                            View Activity
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className='flex flex-col gap-4 border-t border-slate-800 px-6 py-4 text-sm text-slate-400 md:flex-row md:items-center md:justify-between'>
            <span>
              Showing {pageStartIndex + 1}-
              {Math.min(pageStartIndex + indexedRows.length, rows.length)} of{' '}
              {rows.length} users
            </span>
            <div className='flex flex-wrap items-center gap-2'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                disabled={currentPage === 1}
                className='border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800'
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}>
                <ChevronLeft className='h-4 w-4' />
                Previous
              </Button>
              <div className='flex flex-wrap items-center gap-1'>
                {paginationPages.map((page) => (
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
                    onClick={() => setCurrentPage(page)}>
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
                onClick={() =>
                  setCurrentPage((page) => Math.min(pageCount, page + 1))
                }>
                Next
                <ChevronRight className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className='px-6 py-20 text-center text-sm text-slate-500'>
          No users registered yet.
        </div>
      )}
    </div>
  );
}
