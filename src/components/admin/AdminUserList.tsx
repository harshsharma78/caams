'use client';

import { useState } from 'react';

import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Users } from 'lucide-react';
import toast from 'react-hot-toast';

import { EmptyState } from '@/components/ui/EmptyState';

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'assessor';
  provider: string;
  createdAt: string;
}

interface AdminUserListProps {
  users: UserItem[];
  currentUserId: string;
}

export function AdminUserList({ users, currentUserId }: AdminUserListProps) {
  const [userList, setUserList] = useState(users);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (newRole !== 'admin' && newRole !== 'assessor') return;

    setUpdatingId(userId);

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error ?? 'Unable to update role.');
        return;
      }

      setUserList((current) =>
        current.map((u) =>
          u.id === userId ? { ...u, role: newRole as 'admin' | 'assessor' } : u,
        ),
      );

      toast.success(`${data.user?.name ?? 'User'} is now ${newRole}.`);
    } catch {
      toast.error('An unexpected error occurred.');
    } finally {
      setUpdatingId(null);
    }
  };

  const roleBadge: Record<string, string> = {
    admin:
      'border border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-300',
    assessor:
      'border border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
  };

  return (
    <Card>
      <CardHeader>
        <h2 className='text-xl font-semibold text-slate-900 dark:text-slate-50'>
          User management
        </h2>
        <p className='text-sm text-slate-500 dark:text-slate-400'>
          {userList.length} registered user{userList.length !== 1 ? 's' : ''}
        </p>
      </CardHeader>
      <CardContent className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-slate-200 dark:divide-slate-800'>
          <thead className='bg-slate-50 dark:bg-slate-950'>
            <tr className='text-left text-xs uppercase tracking-widest text-slate-500'>
              <th className='px-4 py-3'>Name</th>
              <th className='px-4 py-3'>Email</th>
              <th className='px-4 py-3'>Provider</th>
              <th className='px-4 py-3'>Role</th>
              <th className='px-4 py-3'>Joined</th>
              <th className='px-4 py-3'>Actions</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-slate-100 text-sm dark:divide-slate-800'>
            {userList.map((user) => {
              const isSelf = user.id === currentUserId;

              return (
                <tr key={user.id}>
                  <td className='px-4 py-3 font-medium text-slate-900 dark:text-slate-50'>
                    {user.name}
                    {isSelf ? (
                      <span className='ml-2 text-xs text-slate-400'>(you)</span>
                    ) : null}
                  </td>
                  <td className='px-4 py-3 text-slate-600 dark:text-slate-300'>
                    {user.email}
                  </td>
                  <td className='px-4 py-3 capitalize text-slate-500'>
                    {user.provider}
                  </td>
                  <td className='px-4 py-3'>
                    <Badge className={roleBadge[user.role]}>{user.role}</Badge>
                  </td>
                  <td className='px-4 py-3 text-slate-500'>
                    {new Date(user.createdAt).toLocaleDateString('en-IN', {
                      dateStyle: 'medium',
                    })}
                  </td>
                  <td className='px-4 py-3'>
                    {isSelf ? (
                      <span className='text-xs text-slate-400'>—</span>
                    ) : (
                      <Select
                        value={user.role}
                        disabled={updatingId === user.id}
                        onValueChange={(value) =>
                          handleRoleChange(user.id, value)
                        }>
                        <SelectTrigger className='h-8 w-28 text-xs'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className='border-slate-300 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50'>
                          <SelectItem value='assessor'>Assessor</SelectItem>
                          <SelectItem value='admin'>Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </td>
                </tr>
              );
            })}
            {userList.length === 0 && (
              <tr>
                <td colSpan={6} className='p-0'>
                  <EmptyState
                    icon={<Users className="h-8 w-8" />}
                    title="No users found"
                    description="There are currently no users in the system."
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
