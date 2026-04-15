import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { dbConnect } from '@/lib/db';
import Assessment from '@/models/Assessment';
import Organization from '@/models/Organization';
import SecurityCheck from '@/models/SecurityCheck';
import User from '@/models/User';

export default async function DashboardPage() {
  await dbConnect();

  const [organizations, assessments, securityChecks, users] = await Promise.all(
    [
      Organization.countDocuments(),
      Assessment.countDocuments(),
      SecurityCheck.countDocuments(),
      User.countDocuments(),
    ],
  );

  const stats = [
    {
      label: 'Organizations',
      value: organizations,
      tone: 'from-sky-500 to-cyan-400',
    },
    {
      label: 'Assessments',
      value: assessments,
      tone: 'from-emerald-500 to-teal-400',
    },
    {
      label: 'Security Checks',
      value: securityChecks,
      tone: 'from-amber-500 to-orange-400',
    },
    { label: 'Users', value: users, tone: 'from-fuchsia-500 to-pink-400' },
  ];

  return (
    <div className='space-y-8'>
      <section className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className='overflow-hidden'>
            <CardContent className='relative p-0'>
              <div className={`h-2 w-full bg-gradient-to-r ${stat.tone}`} />
              <div className='space-y-2 p-6'>
                <p className='text-sm font-medium text-slate-500 dark:text-slate-400'>
                  {stat.label}
                </p>
                <p className='text-4xl font-semibold text-slate-900 dark:text-slate-50'>
                  {stat.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
      <section className='grid gap-6 xl:grid-cols-[1.35fr_0.65fr]'>
        <Card>
          <CardHeader>
            <h2 className='text-xl font-semibold text-slate-900 dark:text-slate-50'>
              Project overview
            </h2>
          </CardHeader>
          <CardContent className='space-y-4 text-sm text-slate-600 dark:text-slate-300'>
            <p>
              CAAMS tracks cloud-readiness assessments, organization interviews,
              case studies, and security risk reviews in one workspace.
            </p>
            <p>
              Phase 1 sets up authentication, MongoDB models, organization
              management, Cloudinary uploads, and the protected dashboard shell.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h2 className='text-xl font-semibold text-slate-900 dark:text-slate-50'>
              Delivery target
            </h2>
          </CardHeader>
          <CardContent className='space-y-3 text-sm text-slate-600 dark:text-slate-300'>
            <p>Project deadline: May 15, 2026</p>
            <p>Current milestone: Foundation, auth, and organization module.</p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
