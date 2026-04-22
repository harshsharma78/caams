import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { canViewDashboard } from '@/lib/permissions';
import {
  getDashboardStatsCache,
  setDashboardStatsCache,
} from '@/lib/stats-cache';
import Assessment from '@/models/Assessment';
import CaseStudy from '@/models/CaseStudy';
import Interview from '@/models/Interview';
import Organization from '@/models/Organization';
import SecurityCheck from '@/models/SecurityCheck';
import type {
  DashboardActivityType,
  DashboardMonthlyGrowth,
  DashboardRiskLevel,
  DashboardStatsResponse,
} from '@/types/dashboard';

export const dynamic = 'force-dynamic';

const CACHE_TTL_MS = 60_000;

const assessmentCategoryOrder = [
  'Infrastructure Readiness',
  'Security & Compliance',
  'Application Portability',
  'Data Management',
  'Team & Skills Readiness',
  'Cost & ROI Analysis',
] as const;

const securityCategoryOrder = [
  'IAM',
  'Data Encryption & Privacy',
  'Network Security',
  'Compliance & Regulatory',
  'Incident Response & Recovery',
] as const;

const riskOrder = ['low', 'medium', 'high', 'critical'] as const;
const orgSizeOrder = ['startup', 'sme', 'enterprise'] as const;

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function startOfWeek(date: Date) {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setHours(0, 0, 0, 0);
  copy.setDate(copy.getDate() + diff);
  return copy;
}

function addWeeks(date: Date, weeks: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + weeks * 7);
  return copy;
}

function formatWeekLabel(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function formatMonthLabel(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
  }).format(date);
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function roundToSingleDecimal(value: number) {
  return Math.round(value * 10) / 10;
}

function calculateGrowth(current: number, previous: number) {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }

  return roundToSingleDecimal(((current - previous) / previous) * 100);
}

async function aggregateMonthlyMetric(
  model: typeof Organization | typeof Assessment | typeof Interview | typeof CaseStudy | typeof SecurityCheck,
  dateField: string,
  currentMonthStart: Date,
  nextMonthStart: Date,
  previousMonthStart: Date,
  extraMatch: Record<string, unknown> = {},
) {
  const [result] = await model.aggregate<{
    current: Array<{ count: number }>;
    previous: Array<{ count: number }>;
  }>([
    {
      $facet: {
        current: [
          {
            $match: {
              ...extraMatch,
              [dateField]: {
                $gte: currentMonthStart,
                $lt: nextMonthStart,
              },
            },
          },
          { $count: 'count' },
        ],
        previous: [
          {
            $match: {
              ...extraMatch,
              [dateField]: {
                $gte: previousMonthStart,
                $lt: currentMonthStart,
              },
            },
          },
          { $count: 'count' },
        ],
      },
    },
  ]);

  const current = result?.current[0]?.count ?? 0;
  const previous = result?.previous[0]?.count ?? 0;

  return calculateGrowth(current, previous);
}

async function aggregateMonthlyAverageScore(
  currentMonthStart: Date,
  nextMonthStart: Date,
  previousMonthStart: Date,
) {
  const [result] = await Assessment.aggregate<{
    current: Array<{ avg: number }>;
    previous: Array<{ avg: number }>;
  }>([
    {
      $facet: {
        current: [
          {
            $match: {
              createdAt: {
                $gte: currentMonthStart,
                $lt: nextMonthStart,
              },
            },
          },
          { $group: { _id: null, avg: { $avg: '$overallScore' } } },
        ],
        previous: [
          {
            $match: {
              createdAt: {
                $gte: previousMonthStart,
                $lt: currentMonthStart,
              },
            },
          },
          { $group: { _id: null, avg: { $avg: '$overallScore' } } },
        ],
      },
    },
  ]);

  return calculateGrowth(
    result?.current[0]?.avg ?? 0,
    result?.previous[0]?.avg ?? 0,
  );
}

async function buildDashboardStats(): Promise<DashboardStatsResponse> {
  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const nextMonthStart = addMonths(currentMonthStart, 1);
  const previousMonthStart = addMonths(currentMonthStart, -1);
  const lastTwelveWeeksStart = startOfWeek(addWeeks(now, -11));
  const lastSixMonthsStart = addMonths(currentMonthStart, -5);

  const [
    organizationCount,
    assessmentCount,
    interviewCount,
    caseStudyCount,
    securityCheckCount,
    averageReadinessResult,
    highRiskAlerts,
    assessmentsThisMonth,
    scoresByIndustryRaw,
    riskDistributionRaw,
    assessmentsTrendRaw,
    categoryAveragesRaw,
    orgSizeDistributionRaw,
    topOrganizationsRaw,
    interviewsByMonthRaw,
    caseStudiesBySectorRaw,
    securityCategoryBreakdownRaw,
    recentOrganizationsRaw,
    recentAssessmentsRaw,
    recentInterviewsRaw,
    recentCaseStudiesRaw,
    recentSecurityChecksRaw,
    organizationsGrowth,
    assessmentsGrowth,
    interviewsGrowth,
    caseStudiesGrowth,
    securityChecksGrowth,
    averageReadinessScoreGrowth,
    highRiskAlertsGrowth,
  ] = await Promise.all([
    Organization.countDocuments(),
    Assessment.countDocuments(),
    Interview.countDocuments(),
    CaseStudy.countDocuments(),
    SecurityCheck.countDocuments(),
    Assessment.aggregate<{ avgScore: number }>([
      {
        $group: {
          _id: null,
          avgScore: { $avg: '$overallScore' },
        },
      },
      {
        $project: {
          _id: 0,
          avgScore: { $round: ['$avgScore', 1] },
        },
      },
    ]),
    SecurityCheck.countDocuments({
      overallRisk: { $in: ['high', 'critical'] },
    }),
    Assessment.countDocuments({
      createdAt: {
        $gte: currentMonthStart,
        $lt: nextMonthStart,
      },
    }),
    Assessment.aggregate<{ industry: string; avgScore: number; count: number }>([
      {
        $lookup: {
          from: 'organizations',
          localField: 'orgId',
          foreignField: '_id',
          as: 'organization',
        },
      },
      { $unwind: '$organization' },
      {
        $group: {
          _id: {
            $ifNull: ['$organization.industry', 'Unknown'],
          },
          avgScore: { $avg: '$overallScore' },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          industry: '$_id',
          avgScore: { $round: ['$avgScore', 1] },
          count: 1,
        },
      },
      { $sort: { avgScore: -1, count: -1, industry: 1 } },
    ]),
    SecurityCheck.aggregate<{ level: DashboardRiskLevel; count: number }>([
      {
        $group: {
          _id: '$overallRisk',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          level: '$_id',
          count: 1,
        },
      },
    ]),
    Assessment.aggregate<{ count: number; startDate: Date }>([
      {
        $match: {
          createdAt: { $gte: lastTwelveWeeksStart },
        },
      },
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
      {
        $project: {
          _id: 0,
          count: 1,
          startDate: 1,
        },
      },
    ]),
    Assessment.aggregate<{ category: string; avgScore: number }>([
      { $unwind: '$categories' },
      {
        $group: {
          _id: '$categories.name',
          avgScore: { $avg: '$categories.percentageScore' },
        },
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          avgScore: { $round: ['$avgScore', 1] },
        },
      },
    ]),
    Organization.aggregate<{ size: 'startup' | 'sme' | 'enterprise'; count: number }>([
      {
        $group: {
          _id: '$size',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          size: '$_id',
          count: 1,
        },
      },
    ]),
    Assessment.aggregate<{ name: string; score: number; risk: DashboardRiskLevel }>([
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$orgId',
          latestAssessment: { $first: '$$ROOT' },
        },
      },
      {
        $lookup: {
          from: 'organizations',
          localField: '_id',
          foreignField: '_id',
          as: 'organization',
        },
      },
      { $unwind: '$organization' },
      {
        $lookup: {
          from: 'securitychecks',
          let: { orgId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$orgId', '$$orgId'] },
              },
            },
            { $sort: { createdAt: -1 } },
            { $limit: 1 },
            {
              $project: {
                _id: 0,
                overallRisk: 1,
              },
            },
          ],
          as: 'latestSecurity',
        },
      },
      {
        $project: {
          _id: 0,
          name: '$organization.name',
          score: { $round: ['$latestAssessment.overallScore', 1] },
          risk: {
            $ifNull: [
              { $arrayElemAt: ['$latestSecurity.overallRisk', 0] },
              'unknown',
            ],
          },
        },
      },
      { $sort: { score: -1, name: 1 } },
      { $limit: 5 },
    ]),
    Interview.aggregate<{ count: number; monthStart: Date }>([
      {
        $match: {
          date: { $gte: lastSixMonthsStart },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          count: { $sum: 1 },
          monthStart: { $min: '$date' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      {
        $project: {
          _id: 0,
          count: 1,
          monthStart: 1,
        },
      },
    ]),
    CaseStudy.aggregate<{ sector: string; count: number }>([
      {
        $group: {
          _id: {
            $ifNull: ['$sector', 'Unknown'],
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          sector: '$_id',
          count: 1,
        },
      },
      { $sort: { count: -1, sector: 1 } },
    ]),
    SecurityCheck.aggregate<{ category: string; avgCompliance: number }>([
      { $unwind: '$checklist' },
      {
        $project: {
          category: {
            $switch: {
              branches: [
                {
                  case: {
                    $eq: [
                      '$checklist.category',
                      'Identity & Access Management (IAM)',
                    ],
                  },
                  then: 'IAM',
                },
              ],
              default: '$checklist.category',
            },
          },
          complianceScore: {
            $switch: {
              branches: [
                {
                  case: { $eq: ['$checklist.status', 'compliant'] },
                  then: 100,
                },
                {
                  case: { $eq: ['$checklist.status', 'partial'] },
                  then: 50,
                },
              ],
              default: 0,
            },
          },
        },
      },
      {
        $group: {
          _id: '$category',
          avgCompliance: { $avg: '$complianceScore' },
        },
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          avgCompliance: { $round: ['$avgCompliance', 1] },
        },
      },
    ]),
    Organization.aggregate<{ name: string; industry: string; createdAt: Date }>([
      { $sort: { createdAt: -1 } },
      { $limit: 5 },
      {
        $project: {
          _id: 0,
          name: 1,
          industry: 1,
          createdAt: 1,
        },
      },
    ]),
    Assessment.aggregate<{ overallScore: number; createdAt: Date; organizationName: string }>([
      { $sort: { createdAt: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'organizations',
          localField: 'orgId',
          foreignField: '_id',
          as: 'organization',
        },
      },
      {
        $project: {
          _id: 0,
          overallScore: 1,
          createdAt: 1,
          organizationName: {
            $ifNull: [{ $arrayElemAt: ['$organization.name', 0] }, 'Unknown'],
          },
        },
      },
    ]),
    Interview.aggregate<{ intervieweeName: string; date: Date; organizationName: string }>([
      { $sort: { date: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'organizations',
          localField: 'orgId',
          foreignField: '_id',
          as: 'organization',
        },
      },
      {
        $project: {
          _id: 0,
          intervieweeName: 1,
          date: 1,
          organizationName: {
            $ifNull: [{ $arrayElemAt: ['$organization.name', 0] }, 'Unknown'],
          },
        },
      },
    ]),
    CaseStudy.aggregate<{ title: string; sector: string; createdAt: Date; organization: string }>([
      { $sort: { createdAt: -1 } },
      { $limit: 5 },
      {
        $project: {
          _id: 0,
          title: 1,
          sector: 1,
          createdAt: 1,
          organization: 1,
        },
      },
    ]),
    SecurityCheck.aggregate<{ createdAt: Date; overallRisk: DashboardRiskLevel; organizationName: string }>([
      { $sort: { createdAt: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'organizations',
          localField: 'orgId',
          foreignField: '_id',
          as: 'organization',
        },
      },
      {
        $project: {
          _id: 0,
          createdAt: 1,
          overallRisk: 1,
          organizationName: {
            $ifNull: [{ $arrayElemAt: ['$organization.name', 0] }, 'Unknown'],
          },
        },
      },
    ]),
    aggregateMonthlyMetric(
      Organization,
      'createdAt',
      currentMonthStart,
      nextMonthStart,
      previousMonthStart,
    ),
    aggregateMonthlyMetric(
      Assessment,
      'createdAt',
      currentMonthStart,
      nextMonthStart,
      previousMonthStart,
    ),
    aggregateMonthlyMetric(
      Interview,
      'date',
      currentMonthStart,
      nextMonthStart,
      previousMonthStart,
    ),
    aggregateMonthlyMetric(
      CaseStudy,
      'createdAt',
      currentMonthStart,
      nextMonthStart,
      previousMonthStart,
    ),
    aggregateMonthlyMetric(
      SecurityCheck,
      'createdAt',
      currentMonthStart,
      nextMonthStart,
      previousMonthStart,
    ),
    aggregateMonthlyAverageScore(
      currentMonthStart,
      nextMonthStart,
      previousMonthStart,
    ),
    aggregateMonthlyMetric(
      SecurityCheck,
      'createdAt',
      currentMonthStart,
      nextMonthStart,
      previousMonthStart,
      { overallRisk: { $in: ['high', 'critical'] } },
    ),
  ]);

  const riskDistributionMap = new Map(
    riskDistributionRaw.map((item) => [item.level, item.count]),
  );

  const riskDistribution = riskOrder.map((level) => ({
    level,
    count: riskDistributionMap.get(level) ?? 0,
  }));

  const assessmentsTrendMap = new Map(
    assessmentsTrendRaw.map((item) => [
      toDateKey(startOfWeek(new Date(item.startDate))),
      item.count,
    ]),
  );

  const assessmentsTrend = Array.from({ length: 12 }, (_, index) => {
    const weekStart = addWeeks(lastTwelveWeeksStart, index);

    return {
      week: formatWeekLabel(weekStart),
      count: assessmentsTrendMap.get(toDateKey(weekStart)) ?? 0,
    };
  });

  const categoryAverageMap = new Map(
    categoryAveragesRaw.map((item) => [item.category, item.avgScore]),
  );

  const categoryAverages = assessmentCategoryOrder.map((category) => ({
    category,
    avgScore: categoryAverageMap.get(category) ?? 0,
  }));

  const orgSizeMap = new Map(
    orgSizeDistributionRaw.map((item) => [item.size, item.count]),
  );

  const orgSizeDistribution = orgSizeOrder.map((size) => ({
    size,
    count: orgSizeMap.get(size) ?? 0,
  }));

  const interviewsByMonthMap = new Map(
    interviewsByMonthRaw.map((item) => [
      `${new Date(item.monthStart).getFullYear()}-${new Date(item.monthStart).getMonth()}`,
      item.count,
    ]),
  );

  const interviewsByMonth = Array.from({ length: 6 }, (_, index) => {
    const monthStart = addMonths(lastSixMonthsStart, index);
    const key = `${monthStart.getFullYear()}-${monthStart.getMonth()}`;

    return {
      month: formatMonthLabel(monthStart),
      count: interviewsByMonthMap.get(key) ?? 0,
    };
  });

  const securityCategoryMap = new Map(
    securityCategoryBreakdownRaw.map((item) => [item.category, item.avgCompliance]),
  );

  const securityCategoryBreakdown = securityCategoryOrder.map((category) => ({
    category,
    avgCompliance: securityCategoryMap.get(category) ?? 0,
  }));

  const recentActivity = [
    ...recentOrganizationsRaw.map((item) => ({
      type: 'organization' as DashboardActivityType,
      title: item.name,
      description: `${item.industry} organization added to CAAMS`,
      timestamp: item.createdAt.toISOString(),
      icon: '🏢',
    })),
    ...recentAssessmentsRaw.map((item) => ({
      type: 'assessment' as DashboardActivityType,
      title: `Assessment for ${item.organizationName}`,
      description: `Readiness score recorded at ${roundToSingleDecimal(item.overallScore).toFixed(1)}%`,
      timestamp: item.createdAt.toISOString(),
      icon: '📊',
    })),
    ...recentInterviewsRaw.map((item) => ({
      type: 'interview' as DashboardActivityType,
      title: item.intervieweeName,
      description: `Interview captured for ${item.organizationName}`,
      timestamp: item.date.toISOString(),
      icon: '🎤',
    })),
    ...recentCaseStudiesRaw.map((item) => ({
      type: 'casestudy' as DashboardActivityType,
      title: item.title,
      description: `${item.organization} case study in ${item.sector}`,
      timestamp: item.createdAt.toISOString(),
      icon: '📚',
    })),
    ...recentSecurityChecksRaw.map((item) => ({
      type: 'security' as DashboardActivityType,
      title: `Security review for ${item.organizationName}`,
      description: `${item.overallRisk} risk posture recorded`,
      timestamp: item.createdAt.toISOString(),
      icon: '🔒',
    })),
  ]
    .sort(
      (left, right) =>
        new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime(),
    )
    .slice(0, 15);

  const monthlyGrowth: DashboardMonthlyGrowth = {
    organizations: organizationsGrowth,
    assessments: assessmentsGrowth,
    interviews: interviewsGrowth,
    caseStudies: caseStudiesGrowth,
    securityChecks: securityChecksGrowth,
    averageReadinessScore: averageReadinessScoreGrowth,
    highRiskAlerts: highRiskAlertsGrowth,
    assessmentsThisMonth: assessmentsGrowth,
  };

  return {
    totalOrganizations: organizationCount,
    totalAssessments: assessmentCount,
    totalInterviews: interviewCount,
    totalCaseStudies: caseStudyCount,
    totalSecurityChecks: securityCheckCount,
    averageReadinessScore: averageReadinessResult[0]?.avgScore ?? 0,
    highRiskAlerts,
    assessmentsThisMonth,
    scoresByIndustry: scoresByIndustryRaw,
    riskDistribution,
    assessmentsTrend,
    categoryAverages,
    orgSizeDistribution,
    topOrganizations: topOrganizationsRaw,
    interviewsByMonth,
    caseStudiesBySector: caseStudiesBySectorRaw,
    securityCategoryBreakdown,
    recentActivity,
    monthlyGrowth,
    generatedAt: now.toISOString(),
  };
}

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    if (!canViewDashboard(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    const cached = getDashboardStatsCache();

    if (cached && cached.expiresAt > Date.now()) {
      return NextResponse.json(cached.data);
    }

    await dbConnect();

    const data = await buildDashboardStats();

    setDashboardStatsCache({
      data,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Dashboard stats GET error:', error);

    return NextResponse.json(
      { error: 'Failed to fetch dashboard data.' },
      { status: 500 },
    );
  }
}
