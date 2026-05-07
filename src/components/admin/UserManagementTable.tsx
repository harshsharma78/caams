'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import type { AdminUserTableItem } from '@/types/admin-dashboard';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { AdminPagination } from '@/components/ui/Pagination';
import { roleBadge, statusBadge } from '@/components/admin/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const USERS_PAGE_SIZE = 10;

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

  // Delete user modal state
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleteError, setDeleteError] = useState('');

  const pageCount = Math.max(1, Math.ceil(rows.length / USERS_PAGE_SIZE));
  const pageStartIndex = (currentPage - 1) * USERS_PAGE_SIZE;
  const indexedRows = useMemo(
    () => rows.slice(pageStartIndex, pageStartIndex + USERS_PAGE_SIZE),
    [rows, pageStartIndex],
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

  const deleteUser = (id: string) => {
    setDeleteError('');
    startTransition(async () => {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
      });

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!response.ok) {
        const message = data.error ?? 'Unable to delete user.';
        setDeleteError(message);
        toast.error(message);
        return;
      }

      toast.success('User deleted successfully.');
      setRows((current) => current.filter((row) => row.id !== id));
      setDeleteTarget(null);
    });
  };

  return (
    <>
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
                          {isSelf ? (
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${roleBadge(user.role)}`}>
                              {user.role}
                            </span>
                          ) : (
                            <Select
                              value={user.role}
                              onValueChange={(value) => {
                                if (value !== user.role) {
                                  updateUser(user.id, { role: value });
                                }
                              }}>
                              <SelectTrigger className='h-8 w-28 border-slate-700 bg-slate-900 text-xs text-slate-100'>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className='border-slate-700 bg-slate-950 text-slate-100'>
                                <SelectItem value='admin'>Admin</SelectItem>
                                <SelectItem value='assessor'>Assessor</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
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
                          <div className='flex flex-wrap items-center gap-2'>
                            <Button
                              type='button'
                              variant='outline'
                              size='sm'
                              disabled={pendingId || isSelf}
                              className='border-red-700/60 bg-transparent text-xs text-red-400 hover:bg-red-950/40 hover:text-red-300'
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
                            </Button>
                            <Button
                              type='button'
                              variant='outline'
                              size='sm'
                              disabled={pendingId || isSelf}
                              className='border-rose-700/60 bg-transparent text-xs text-rose-400 hover:bg-rose-950/40 hover:text-rose-300'
                              onClick={() =>
                                setDeleteTarget({ id: user.id, name: user.name })
                              }>
                              <Trash2 className='h-3.5 w-3.5' />
                              Delete
                            </Button>
                            <Button
                              asChild
                              variant='outline'
                              size='sm'
                              className='border-slate-700 bg-transparent text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-300'>
                              <Link href='#audit-log'>View Activity</Link>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <AdminPagination
              currentPage={currentPage}
              totalItems={rows.length}
              pageSize={USERS_PAGE_SIZE}
              onPageChange={setCurrentPage}
              itemLabel='users'
            />
          </>
        ) : (
          <div className='px-6 py-20 text-center text-sm text-slate-500'>
            No users registered yet.
          </div>
        )}
      </div>

      {/* Delete user confirmation modal */}
      <Modal
        open={!!deleteTarget}
        title='Delete user'
        description={`Permanently delete "${deleteTarget?.name ?? ''}"? This action cannot be undone.`}
        confirmLabel={pendingId ? 'Deleting...' : 'Delete'}
        confirmVariant='danger'
        isLoading={pendingId}
        onClose={() => {
          if (!pendingId) {
            setDeleteTarget(null);
            setDeleteError('');
          }
        }}
        onConfirm={() => {
          if (deleteTarget) {
            deleteUser(deleteTarget.id);
          }
        }}>
        {deleteError ? <p className='text-sm text-rose-600'>{deleteError}</p> : null}
      </Modal>
    </>
  );
}
