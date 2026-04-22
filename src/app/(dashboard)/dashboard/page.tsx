import type { Metadata } from 'next';
import { Card, CardContent } from '@/components/ui/Card';
import { DashboardCharts } from '@/components/dashboard/DashboardCharts';
import { dbConnect } from '@/lib/db';
import Assessment from '@/models/Assessment';
import Interview from '@/models/Interview';
import Organization from '@/models/Organization';
import SecurityCheck from '@/models/SecurityCheck';

export const metadata: Metadata = {
  title: 'CAAMS | Dashboard',
};

interface RecentActivity {
  id: string;
  type: 'assessment' | 'interview' | 'organization';
  label: string;
  description: string;
  date: string;
}

export default async function DashboardPage() {
  await dbConnect();

  // --- Summary cards ---
  const [orgCount, assessmentCount, securityAlerts, avgScoreResult] =
    await Promise.all([
      Organization.countDocuments(),
      Assessment.countDocuments(),
      SecurityCheck.countDocuments({
        overallRisk: { $in: ['high', 'critical'] },
      }),
      Assessment.aggregate([
        { $group: { _id: null, avg: { $avg: '$overallScore' } } },
      ]),
    ]);

  const avgScore =
    avgScoreResult.length > 0 ? Math.round(avgScoreResult[0].avg * 10) / 10 : 0;

  const stats = [
    {
      label: 'Total Organizations',
      value: orgCount,
      tone: 'from-sky-500 to-cyan-400',
    },
    {
      label: 'Assessments Completed',
      value: assessmentCount,
      tone: 'from-emerald-500 to-teal-400',
    },
    {
      label: 'Avg Readiness Score',
      value: avgScore.toFixed(1),
      tone: 'from-violet-500 to-purple-400',
    },
    {
      label: 'High Risk Alerts',
      value: securityAlerts,
      tone: 'from-rose-500 to-pink-400',
    },
  ];

  // --- BarChart: Avg score by industry ---
  const industryScores = await Assessment.aggregate([
    {
      $lookup: {
        from: 'organizations',
        localField: 'orgId',
        foreignField: '_id',
        as: 'org',
      },
    },
    { $unwind: '$org' },
    {
      $group: {
        _id: '$org.industry',
        avgScore: { $avg: '$overallScore' },
        count: { $sum: 1 },
      },
    },
    { $sort: { avgScore: -1 } },
    { $limit: 10 },
  ]);

  const barData = industryScores.map(
    (item: { _id: string; avgScore: number; count: number }) => ({
      industry: item._id,
      score: Math.round(item.avgScore * 10) / 10,
      count: item.count,
    }),
  );

  // --- PieChart: Risk distribution ---
  const statusCounts = await Assessment.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const statusLabels: Record<string, string> = {
    'not-ready': 'Not Ready',
    'partially-ready': 'Partially Ready',
    'mostly-ready': 'Mostly Ready',
    'cloud-ready': 'Cloud Ready',
  };

  const statusColors: Record<string, string> = {
    'not-ready': '#f43f5e',
    'partially-ready': '#f97316',
    'mostly-ready': '#f59e0b',
    'cloud-ready': '#10b981',
  };

  const pieData = statusCounts.map((item: { _id: string; count: number }) => ({
    name: statusLabels[item._id] || item._id,
    value: item.count,
    color: statusColors[item._id] || '#64748b',
  }));

  // --- LineChart: Assessments per week (last 8 weeks) ---
  const eightWeeksAgo = new Date();
  eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);

  const weeklyAssessments = await Assessment.aggregate([
    { $match: { createdAt: { $gte: eightWeeksAgo } } },
    {
      $group: {
        _id: {
          year: { $isoWeekYear: '$createdAt' },
          week: { $isoWeek: '$createdAt' },
        },
        count: { $sum: 1 },
        startDate: { $min: '$createdAt' },
      },
    },
    { $sort: { '_id.year': 1, '_id.week': 1 } },
  ]);

  const lineData = weeklyAssessments.map(
    (item: { _id: { week: number }; count: number; startDate: Date }) => ({
      week: `W${item._id.week}`,
      assessments: item.count,
    }),
  );

  // --- RadarChart: Average category scores ---
  const categoryAverages = await Assessment.aggregate([
    { $unwind: '$categories' },
    {
      $group: {
        _id: '$categories.name',
        avgScore: { $avg: '$categories.averageScore' },
      },
    },
  ]);

  const radarData = categoryAverages.map(
    (item: { _id: string; avgScore: number }) => ({
      category: item._id.replace(' & ', '\n& '),
      score: Math.round(item.avgScore * 10) / 10,
      fullMark: 5,
    }),
  );

  // --- Recent activity: last 10 actions ---
  const [recentAssessments, recentInterviews, recentOrganizations] =
    await Promise.all([
      Assessment.find()
        .populate('orgId', 'name')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      Interview.find()
        .populate('orgId', 'name')
        .sort({ date: -1 })
        .limit(10)
        .lean(),
      Organization.find().sort({ createdAt: -1 }).limit(10).lean(),
    ]);

  const activities: RecentActivity[] = [
    ...recentAssessments.map((a) => ({
      id: a._id.toString(),
      type: 'assessment' as const,
      label: 'Assessment Created',
      description: `Score ${a.overallScore.toFixed(1)} for ${a.orgId?.name || 'Unknown'}`,
      date: a.createdAt.toISOString(),
    })),
    ...recentInterviews.map((i) => ({
      id: i._id.toString(),
      type: 'interview' as const,
      label: 'Interview Recorded',
      description: `${i.intervieweeName} at ${i.orgId?.name || 'Unknown'}`,
      date: i.date.toISOString(),
    })),
    ...recentOrganizations.map((o) => ({
      id: o._id.toString(),
      type: 'organization' as const,
      label: 'Organization Added',
      description: `${o.name} (${o.industry})`,
      date: o.createdAt.toISOString(),
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  const typeBadge: Record<string, string> = {
    assessment:
      'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    interview: 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
    organization:
      'bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
  };

  return (
    <div className='space-y-8'>
      {/* Summary cards */}
      <section className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className='overflow-hidden'>
            <CardContent className='relative p-0'>
              <div className={`h-2 w-full bg-linear-to-r ${stat.tone}`} />
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

      {/* Charts */}
      <DashboardCharts
        barData={barData}
        pieData={pieData}
        lineData={lineData}
        radarData={radarData}
      />

      {/* Recent activity feed */}
      <Card>
        <CardContent className='space-y-1 p-6'>
          <h2 className='mb-4 text-xl font-semibold text-slate-900 dark:text-slate-50'>
            Recent activity
          </h2>
          {activities.length ? (
            <div className='divide-y divide-slate-100 dark:divide-slate-800'>
              {activities.map((activity) => (
                <div
                  key={`${activity.type}-${activity.id}`}
                  className='flex items-center gap-4 py-3'>
                  <span
                    className={`inline-flex min-w-24 shrink-0 items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${typeBadge[activity.type]}`}>
                    {activity.type}
                  </span>
                  <div className='min-w-0 flex-1'>
                    <p className='text-sm font-medium text-slate-900 dark:text-slate-50'>
                      {activity.label}
                    </p>
                    <p className='truncate text-sm text-slate-500 dark:text-slate-400'>
                      {activity.description}
                    </p>
                  </div>
                  <time className='shrink-0 text-xs text-slate-400 dark:text-slate-500'>
                    {new Intl.DateTimeFormat('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    }).format(new Date(activity.date))}
                  </time>
                </div>
              ))}
            </div>
          ) : (
            <p className='py-8 text-center text-sm text-slate-500 dark:text-slate-400'>
              No recent activity.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
