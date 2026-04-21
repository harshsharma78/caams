import { redirect } from 'next/navigation';

import { AdminUserList } from '@/components/admin/AdminUserList';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { auth } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { isAdmin } from '@/lib/permissions';
import Assessment from '@/models/Assessment';
import CaseStudy from '@/models/CaseStudy';
import Interview from '@/models/Interview';
import Organization from '@/models/Organization';
import SecurityCheck from '@/models/SecurityCheck';
import User from '@/models/User';

interface RecentAction {
  id: string;
  type: string;
  label: string;
  date: string;
}

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user || !isAdmin(session.user.role)) {
    redirect('/dashboard');
  }

  await dbConnect();

  const [
    users,
    orgCount,
    assessmentCount,
    interviewCount,
    securityCheckCount,
    caseStudyCount,
    userCount,
  ] = await Promise.all([
    User.find().sort({ createdAt: -1 }).lean(),
    Organization.countDocuments(),
    Assessment.countDocuments(),
    Interview.countDocuments(),
    SecurityCheck.countDocuments(),
    CaseStudy.countDocuments(),
    User.countDocuments(),
  ]);

  const systemStats = [
    { label: 'Users', count: userCount, tone: 'from-fuchsia-500 to-pink-400' },
    {
      label: 'Organizations',
      count: orgCount,
      tone: 'from-sky-500 to-cyan-400',
    },
    {
      label: 'Assessments',
      count: assessmentCount,
      tone: 'from-emerald-500 to-teal-400',
    },
    {
      label: 'Interviews',
      count: interviewCount,
      tone: 'from-violet-500 to-purple-400',
    },
    {
      label: 'Security Checks',
      count: securityCheckCount,
      tone: 'from-amber-500 to-orange-400',
    },
    {
      label: 'Case Studies',
      count: caseStudyCount,
      tone: 'from-rose-500 to-red-400',
    },
  ];

  // Build recent activity from all models (last 50)
  const [recentAssessments, recentInterviews, recentOrgs, recentUsers] =
    await Promise.all([
      Assessment.find()
        .populate('orgId', 'name')
        .sort({ createdAt: -1 })
        .limit(15)
        .lean(),
      Interview.find()
        .populate('orgId', 'name')
        .sort({ date: -1 })
        .limit(15)
        .lean(),
      Organization.find().sort({ createdAt: -1 }).limit(10).lean(),
      User.find().sort({ createdAt: -1 }).limit(10).lean(),
    ]);

  const auditLog: RecentAction[] = [
    ...recentAssessments.map((a) => ({
      id: a._id.toString(),
      type: 'Assessment',
      label: `Assessment scored ${a.overallScore.toFixed(1)} for ${a.orgId?.name || 'Unknown'}`,
      date: a.createdAt.toISOString(),
    })),
    ...recentInterviews.map((i) => ({
      id: i._id.toString(),
      type: 'Interview',
      label: `${i.intervieweeName} interviewed at ${i.orgId?.name || 'Unknown'}`,
      date: i.date.toISOString(),
    })),
    ...recentOrgs.map((o) => ({
      id: o._id.toString(),
      type: 'Organization',
      label: `${o.name} created`,
      date: o.createdAt.toISOString(),
    })),
    ...recentUsers.map((u) => ({
      id: u._id.toString(),
      type: 'User',
      label: `${u.name} (${u.email}) registered`,
      date: u.createdAt.toISOString(),
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 50);

  const typeBadge: Record<string, string> = {
    Assessment:
      'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    Interview: 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
    Organization:
      'bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
    User: 'bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-950 dark:text-fuchsia-300',
  };

  return (
    <div className='space-y-8'>
      <PageHeader
        title='Admin Panel'
        description='Manage users, view system statistics, and review activity.'
      />

      {/* System Stats */}
      <section className='grid gap-4 md:grid-cols-3 xl:grid-cols-6'>
        {systemStats.map((stat) => (
          <Card
            key={stat.label}
            className='overflow-hidden'>
            <CardContent className='p-0'>
              <div className={`h-1.5 bg-linear-to-r ${stat.tone}`} />
              <div className='space-y-1 p-4'>
                <p className='text-xs font-medium text-slate-500 dark:text-slate-400'>
                  {stat.label}
                </p>
                <p className='text-2xl font-semibold text-slate-900 dark:text-slate-50'>
                  {stat.count}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* User Management */}
      <AdminUserList
        users={users.map((u) => ({
          id: u._id.toString(),
          name: u.name,
          email: u.email,
          role: u.role as 'admin' | 'viewer',
          provider: u.provider,
          createdAt: u.createdAt.toISOString(),
        }))}
        currentUserId={session.user.id}
      />

      {/* Audit Log */}
      <Card>
        <CardHeader>
          <h2 className='text-xl font-semibold text-slate-900 dark:text-slate-50'>
            Activity log
          </h2>
          <p className='text-sm text-slate-500 dark:text-slate-400'>
            Last 50 actions across the platform
          </p>
        </CardHeader>
        <CardContent className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-slate-200 dark:divide-slate-800'>
            <thead className='bg-slate-50 dark:bg-slate-950'>
              <tr className='text-left text-xs uppercase tracking-widest text-slate-500'>
                <th className='px-4 py-3'>Type</th>
                <th className='px-4 py-3'>Action</th>
                <th className='px-4 py-3'>Date</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-100 text-sm dark:divide-slate-800'>
              {auditLog.map((action, index) => (
                <tr key={`${action.type}-${action.id}-${index}`}>
                  <td className='px-4 py-3'>
                    <Badge
                      className={`text-xs ${typeBadge[action.type] ?? ''}`}>
                      {action.type}
                    </Badge>
                  </td>
                  <td className='px-4 py-3 text-slate-700 dark:text-slate-200'>
                    {action.label}
                  </td>
                  <td className='px-4 py-3 text-slate-500'>
                    {new Intl.DateTimeFormat('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    }).format(new Date(action.date))}
                  </td>
                </tr>
              ))}
              {!auditLog.length ? (
                <tr>
                  <td
                    colSpan={3}
                    className='px-4 py-12 text-center text-slate-500'>
                    No activity recorded yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
