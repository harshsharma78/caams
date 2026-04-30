import mongoose from 'mongoose';
import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { isAdmin } from '@/lib/permissions';
import Assessment from '@/models/Assessment';
import AuditLog from '@/models/AuditLog';
import CaseStudy from '@/models/CaseStudy';
import Interview from '@/models/Interview';
import Organization from '@/models/Organization';
import SecurityCheck from '@/models/SecurityCheck';
import Subscription from '@/models/Subscription';
import SystemLog from '@/models/SystemLog';
import User from '@/models/User';
import type { AdminDashboardData } from '@/types/admin-dashboard';

export const dynamic = 'force-dynamic';

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
const subscriptionPlanOrder = [
  'free',
  'starter',
  'professional',
  'enterprise',
] as const;
const organizationStatusOrder = [
  'active',
  'inactive',
  'suspended',
  'trial',
] as const;

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
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

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatWeekLabel(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function formatDayLabel(date: Date) {
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

function formatHourLabel(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
  }).format(date);
}

function round1(value: number) {
  return Math.round(value * 10) / 10;
}

function calculateGrowth(current: number, previous: number) {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }

  return round1(((current - previous) / previous) * 100);
}

async function aggregateMonthlyCount(
  model:
    | typeof User
    | typeof Organization
    | typeof Assessment
    | typeof Interview
    | typeof Subscription,
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

  return calculateGrowth(
    result?.current[0]?.count ?? 0,
    result?.previous[0]?.count ?? 0,
  );
}

async function aggregateMonthlyRevenueGrowth(
  currentMonthStart: Date,
  nextMonthStart: Date,
  previousMonthStart: Date,
) {
  const [result] = await Subscription.aggregate<{
    current: Array<{ revenue: number }>;
    previous: Array<{ revenue: number }>;
  }>([
    {
      $facet: {
        current: [
          {
            $match: {
              status: { $in: ['active', 'trial', 'past_due'] },
              currentPeriodStart: {
                $gte: currentMonthStart,
                $lt: nextMonthStart,
              },
            },
          },
          { $group: { _id: null, revenue: { $sum: '$amount' } } },
        ],
        previous: [
          {
            $match: {
              status: { $in: ['active', 'trial', 'past_due'] },
              currentPeriodStart: {
                $gte: previousMonthStart,
                $lt: currentMonthStart,
              },
            },
          },
          { $group: { _id: null, revenue: { $sum: '$amount' } } },
        ],
      },
    },
  ]);

  return calculateGrowth(
    result?.current[0]?.revenue ?? 0,
    result?.previous[0]?.revenue ?? 0,
  );
}

async function buildAdminStats(): Promise<AdminDashboardData> {
  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const nextMonthStart = addMonths(currentMonthStart, 1);
  const previousMonthStart = addMonths(currentMonthStart, -1);
  const todayStart = startOfDay(now);
  const tomorrowStart = addDays(todayStart, 1);
  const last24HoursStart = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const last7DaysStart = addDays(todayStart, -6);
  const last14DaysStart = addDays(todayStart, -13);
  const last30DaysStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const last60DaysStart = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  const lastTwelveWeeksStart = startOfWeek(addWeeks(now, -11));
  const lastSixMonthsStart = addMonths(currentMonthStart, -5);
  const lastTwelveMonthsStart = addMonths(currentMonthStart, -11);
  const last24HoursBucketStart = new Date(
    now.getTime() - 23 * 60 * 60 * 1000,
  );
  last24HoursBucketStart.setMinutes(0, 0, 0);

  const [
    totalUsers,
    activeUsers,
    newUsersThisMonth,
    pendingApprovals,
    suspendedUsers,
    adminCount,
    usersByRoleRaw,
    userGrowthTrendRaw,
    userActivityHeatmapRaw,
    totalOrganizations,
    totalAssessments,
    totalInterviews,
    totalCaseStudies,
    totalSecurityChecks,
    platformAverageReadinessRaw,
    highRiskOrganizationsRaw,
    assessmentsThisMonth,
    totalAuditEvents,
    auditEventsToday,
    failedLoginAttempts,
    criticalAlerts,
    auditEventsByTypeRaw,
    auditTrendRaw,
    recentAuditLogsRaw,
    systemHealthRaw,
    systemErrorTrendRaw,
    subscriptionBreakdownRaw,
    totalMonthlyRevenueRaw,
    churnedSubscriptions,
    trialConversions,
    revenueTrendRaw,
    orgsByStatusRaw,
    topOrganizationsByActivityRaw,
    inactiveOrganizationsRaw,
    scoresByIndustryRaw,
    riskDistributionRaw,
    categoryAveragesRaw,
    orgSizeDistributionRaw,
    caseStudiesBySectorRaw,
    securityCategoryBreakdownRaw,
    interviewsByMonthRaw,
    usersGrowth,
    organizationsGrowth,
    assessmentsGrowth,
    interviewsGrowth,
    revenueGrowth,
    topUsersRaw,
    recentUsersRaw,
    recentOrganizationsRaw,
    recentAssessmentsRaw,
    recentInterviewsRaw,
    recentCaseStudiesRaw,
    recentSecurityChecksRaw,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({
      lastLoginAt: { $gte: last30DaysStart },
      status: { $ne: 'suspended' },
    }),
    User.countDocuments({
      createdAt: { $gte: currentMonthStart, $lt: nextMonthStart },
    }),
    User.countDocuments({ status: 'pending' }),
    User.countDocuments({ status: 'suspended' }),
    User.countDocuments({ role: 'admin' }),
    User.aggregate<{ role: string; count: number }>([
      { $group: { _id: '$role', count: { $sum: 1 } } },
      { $project: { _id: 0, role: '$_id', count: 1 } },
      { $sort: { count: -1, role: 1 } },
    ]),
    User.aggregate<{ createdAt: Date; count: number }>([
      { $match: { createdAt: { $gte: lastTwelveWeeksStart } } },
      {
        $group: {
          _id: {
            year: { $isoWeekYear: '$createdAt' },
            week: { $isoWeek: '$createdAt' },
          },
          createdAt: { $min: '$createdAt' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.week': 1 } },
      { $project: { _id: 0, createdAt: 1, count: 1 } },
    ]),
    AuditLog.aggregate<{ day: string; hour: number; count: number }>([
      {
        $match: {
          createdAt: { $gte: last30DaysStart },
          action: { $regex: 'LOGIN', $options: 'i' },
        },
      },
      {
        $group: {
          _id: {
            day: { $dayOfWeek: '$createdAt' },
            hour: { $hour: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          day: {
            $arrayElemAt: [
              [
                'Sun',
                'Mon',
                'Tue',
                'Wed',
                'Thu',
                'Fri',
                'Sat',
              ],
              { $subtract: ['$_id.day', 1] },
            ],
          },
          hour: '$_id.hour',
          count: 1,
        },
      },
      { $sort: { day: 1, hour: 1 } },
    ]),
    Organization.countDocuments(),
    Assessment.countDocuments(),
    Interview.countDocuments(),
    CaseStudy.countDocuments(),
    SecurityCheck.countDocuments(),
    Assessment.aggregate<{ avgScore: number }>([
      { $group: { _id: null, avgScore: { $avg: '$overallScore' } } },
      { $project: { _id: 0, avgScore: { $round: ['$avgScore', 1] } } },
    ]),
    SecurityCheck.aggregate<{ count: number }>([
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$orgId',
          latestRisk: { $first: '$overallRisk' },
        },
      },
      {
        $match: {
          latestRisk: { $in: ['high', 'critical'] },
        },
      },
      { $count: 'count' },
    ]),
    Assessment.countDocuments({
      createdAt: { $gte: currentMonthStart, $lt: nextMonthStart },
    }),
    AuditLog.countDocuments(),
    AuditLog.countDocuments({
      createdAt: { $gte: todayStart, $lt: tomorrowStart },
    }),
    AuditLog.countDocuments({
      action: 'LOGIN_FAILED',
      createdAt: { $gte: last24HoursStart },
    }),
    AuditLog.countDocuments({
      severity: 'critical',
      createdAt: { $gte: last7DaysStart },
    }),
    AuditLog.aggregate<{ type: string; count: number }>([
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $project: { _id: 0, type: '$_id', count: 1 } },
      { $sort: { count: -1, type: 1 } },
      { $limit: 10 },
    ]),
    AuditLog.aggregate<{ createdAt: Date; count: number }>([
      { $match: { createdAt: { $gte: last14DaysStart } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          createdAt: { $min: '$createdAt' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
      { $project: { _id: 0, createdAt: 1, count: 1 } },
    ]),
    AuditLog.aggregate<{
      user: string;
      action: string;
      resource: string;
      ip: string;
      timestamp: Date;
      severity: 'info' | 'warning' | 'critical';
    }>([
      { $sort: { createdAt: -1 } },
      { $limit: 20 },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $project: {
          _id: 0,
          user: {
            $ifNull: [
              { $arrayElemAt: ['$user.name', 0] },
              { $ifNull: ['$userName', 'System'] },
            ],
          },
          action: 1,
          resource: 1,
          ip: 1,
          timestamp: '$createdAt',
          severity: 1,
        },
      },
    ]),
    SystemLog.aggregate<{
      avgResponseTime: Array<{ value: number }>;
      totalRequests: Array<{ value: number }>;
      totalErrors: Array<{ value: number }>;
      requestsToday: Array<{ value: number }>;
    }>([
      {
        $facet: {
          avgResponseTime: [
            { $match: { createdAt: { $gte: last24HoursStart } } },
            { $group: { _id: null, value: { $avg: '$responseTimeMs' } } },
          ],
          totalRequests: [
            { $match: { createdAt: { $gte: last24HoursStart } } },
            { $count: 'value' },
          ],
          totalErrors: [
            {
              $match: {
                createdAt: { $gte: last24HoursStart },
                statusCode: { $gte: 500, $lt: 600 },
              },
            },
            { $count: 'value' },
          ],
          requestsToday: [
            {
              $match: {
                createdAt: { $gte: todayStart, $lt: tomorrowStart },
              },
            },
            { $count: 'value' },
          ],
        },
      },
    ]),
    SystemLog.aggregate<{ createdAt: Date; requests: number; errors: number }>([
      { $match: { createdAt: { $gte: last24HoursBucketStart } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
            hour: { $hour: '$createdAt' },
          },
          createdAt: { $min: '$createdAt' },
          requests: { $sum: 1 },
          errors: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ['$statusCode', 500] },
                    { $lt: ['$statusCode', 600] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
          '_id.day': 1,
          '_id.hour': 1,
        },
      },
      { $project: { _id: 0, createdAt: 1, requests: 1, errors: 1 } },
    ]),
    Subscription.aggregate<{ plan: string; count: number; revenue: number }>([
      {
        $match: {
          status: { $in: ['active', 'trial', 'past_due'] },
        },
      },
      {
        $group: {
          _id: '$plan',
          count: { $sum: 1 },
          revenue: { $sum: '$amount' },
        },
      },
      {
        $project: {
          _id: 0,
          plan: '$_id',
          count: 1,
          revenue: { $round: ['$revenue', 2] },
        },
      },
    ]),
    Subscription.aggregate<{ revenue: number }>([
      {
        $match: {
          status: { $in: ['active', 'trial', 'past_due'] },
          currentPeriodStart: {
            $gte: currentMonthStart,
            $lt: nextMonthStart,
          },
        },
      },
      { $group: { _id: null, revenue: { $sum: '$amount' } } },
      { $project: { _id: 0, revenue: { $round: ['$revenue', 2] } } },
    ]),
    Subscription.countDocuments({
      status: 'cancelled',
      cancelledAt: { $gte: currentMonthStart, $lt: nextMonthStart },
    }),
    Subscription.countDocuments({
      convertedAt: { $gte: currentMonthStart, $lt: nextMonthStart },
    }),
    Subscription.aggregate<{ periodStart: Date; revenue: number }>([
      {
        $match: {
          currentPeriodStart: { $gte: lastTwelveMonthsStart },
          status: { $in: ['active', 'trial', 'past_due'] },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$currentPeriodStart' },
            month: { $month: '$currentPeriodStart' },
          },
          periodStart: { $min: '$currentPeriodStart' },
          revenue: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      {
        $project: {
          _id: 0,
          periodStart: 1,
          revenue: { $round: ['$revenue', 2] },
        },
      },
    ]),
    Organization.aggregate<{ status: string; count: number }>([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { _id: 0, status: '$_id', count: 1 } },
    ]),
    Organization.aggregate<{
      name: string;
      industry: string;
      assessmentCount: number;
      latestScore: number;
      riskLevel: string;
      plan: string;
      lastActivity: Date;
    }>([
      {
        $lookup: {
          from: 'assessments',
          let: { orgId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$orgId', '$$orgId'] } } },
            { $sort: { createdAt: -1 } },
          ],
          as: 'assessments',
        },
      },
      {
        $lookup: {
          from: 'interviews',
          let: { orgId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$orgId', '$$orgId'] } } },
            { $sort: { date: -1 } },
          ],
          as: 'interviews',
        },
      },
      {
        $lookup: {
          from: 'securitychecks',
          let: { orgId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$orgId', '$$orgId'] } } },
            { $sort: { createdAt: -1 } },
          ],
          as: 'securityChecks',
        },
      },
      {
        $lookup: {
          from: 'subscriptions',
          let: { orgId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$orgId', '$$orgId'] } } },
            { $sort: { currentPeriodStart: -1, createdAt: -1 } },
            { $limit: 1 },
          ],
          as: 'subscription',
        },
      },
      {
        $project: {
          _id: 0,
          name: 1,
          industry: 1,
          assessmentCount: { $size: '$assessments' },
          latestScore: {
            $round: [
              {
                $ifNull: [{ $arrayElemAt: ['$assessments.overallScore', 0] }, 0],
              },
              1,
            ],
          },
          riskLevel: {
            $ifNull: [
              { $arrayElemAt: ['$securityChecks.overallRisk', 0] },
              'unknown',
            ],
          },
          plan: {
            $ifNull: [{ $arrayElemAt: ['$subscription.plan', 0] }, 'free'],
          },
          lastActivity: {
            $max: [
              { $ifNull: [{ $arrayElemAt: ['$assessments.createdAt', 0] }, '$createdAt'] },
              { $ifNull: [{ $arrayElemAt: ['$interviews.date', 0] }, '$createdAt'] },
              { $ifNull: [{ $arrayElemAt: ['$securityChecks.createdAt', 0] }, '$createdAt'] },
            ],
          },
        },
      },
      { $sort: { assessmentCount: -1, lastActivity: -1, name: 1 } },
      { $limit: 10 },
    ]),
    Organization.aggregate<{
      name: string;
      lastActivity: Date;
      daysSinceActivity: number;
    }>([
      {
        $lookup: {
          from: 'assessments',
          let: { orgId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$orgId', '$$orgId'] } } },
            { $sort: { createdAt: -1 } },
            { $limit: 1 },
          ],
          as: 'latestAssessment',
        },
      },
      {
        $lookup: {
          from: 'interviews',
          let: { orgId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$orgId', '$$orgId'] } } },
            { $sort: { date: -1 } },
            { $limit: 1 },
          ],
          as: 'latestInterview',
        },
      },
      {
        $lookup: {
          from: 'securitychecks',
          let: { orgId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$orgId', '$$orgId'] } } },
            { $sort: { createdAt: -1 } },
            { $limit: 1 },
          ],
          as: 'latestSecurity',
        },
      },
      {
        $project: {
          _id: 0,
          name: 1,
          lastActivity: {
            $max: [
              { $ifNull: [{ $arrayElemAt: ['$latestAssessment.createdAt', 0] }, '$createdAt'] },
              { $ifNull: [{ $arrayElemAt: ['$latestInterview.date', 0] }, '$createdAt'] },
              { $ifNull: [{ $arrayElemAt: ['$latestSecurity.createdAt', 0] }, '$createdAt'] },
            ],
          },
        },
      },
      {
        $addFields: {
          daysSinceActivity: {
            $dateDiff: {
              startDate: '$lastActivity',
              endDate: now,
              unit: 'day',
            },
          },
        },
      },
      { $match: { lastActivity: { $lt: last60DaysStart } } },
      { $sort: { lastActivity: 1 } },
      { $limit: 5 },
    ]),
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
          _id: { $ifNull: ['$organization.industry', 'Unknown'] },
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
    SecurityCheck.aggregate<{ level: string; count: number }>([
      { $group: { _id: '$overallRisk', count: { $sum: 1 } } },
      { $project: { _id: 0, level: '$_id', count: 1 } },
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
    Organization.aggregate<{ size: string; count: number }>([
      { $group: { _id: '$size', count: { $sum: 1 } } },
      { $project: { _id: 0, size: '$_id', count: 1 } },
    ]),
    CaseStudy.aggregate<{ sector: string; count: number }>([
      { $group: { _id: { $ifNull: ['$sector', 'Unknown'] }, count: { $sum: 1 } } },
      { $project: { _id: 0, sector: '$_id', count: 1 } },
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
                { case: { $eq: ['$checklist.status', 'compliant'] }, then: 100 },
                { case: { $eq: ['$checklist.status', 'partial'] }, then: 50 },
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
    Interview.aggregate<{ monthStart: Date; count: number }>([
      { $match: { date: { $gte: lastSixMonthsStart } } },
      {
        $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' } },
          monthStart: { $min: '$date' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $project: { _id: 0, monthStart: 1, count: 1 } },
    ]),
    aggregateMonthlyCount(
      User,
      'createdAt',
      currentMonthStart,
      nextMonthStart,
      previousMonthStart,
    ),
    aggregateMonthlyCount(
      Organization,
      'createdAt',
      currentMonthStart,
      nextMonthStart,
      previousMonthStart,
    ),
    aggregateMonthlyCount(
      Assessment,
      'createdAt',
      currentMonthStart,
      nextMonthStart,
      previousMonthStart,
    ),
    aggregateMonthlyCount(
      Interview,
      'date',
      currentMonthStart,
      nextMonthStart,
      previousMonthStart,
    ),
    aggregateMonthlyRevenueGrowth(
      currentMonthStart,
      nextMonthStart,
      previousMonthStart,
    ),
    User.find({})
      .sort({ lastLoginAt: -1, createdAt: -1 })
      .lean(),
    User.find({}).sort({ createdAt: -1 }).limit(5).lean(),
    Organization.find({}).sort({ createdAt: -1 }).limit(5).lean(),
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
    CaseStudy.find({}).sort({ createdAt: -1 }).limit(5).lean(),
    SecurityCheck.aggregate<{ createdAt: Date; overallRisk: string; organizationName: string }>([
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
  ]);

  const dbReady = mongoose.connection.readyState === 1;
  const avgResponseTime = round1(
    systemHealthRaw[0]?.avgResponseTime[0]?.value ?? 0,
  );
  const requestsLast24Hours = systemHealthRaw[0]?.totalRequests[0]?.value ?? 0;
  const errorsLast24Hours = systemHealthRaw[0]?.totalErrors[0]?.value ?? 0;
  const requestsToday = systemHealthRaw[0]?.requestsToday[0]?.value ?? 0;
  const errorRate = requestsLast24Hours
    ? round1((errorsLast24Hours / requestsLast24Hours) * 100)
    : 0;

  const uptime30DaysRaw = await SystemLog.aggregate<{ total: number; errors: number }>([
    { $match: { createdAt: { $gte: last30DaysStart } } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        errors: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $gte: ['$statusCode', 500] },
                  { $lt: ['$statusCode', 600] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
    { $project: { _id: 0, total: 1, errors: 1 } },
  ]);

  const uptime = uptime30DaysRaw[0]?.total
    ? round1(
        ((uptime30DaysRaw[0].total - uptime30DaysRaw[0].errors) /
          uptime30DaysRaw[0].total) *
          100,
      )
    : dbReady
      ? 100
      : 0;

  const activeSessionCount = await User.countDocuments({
    sessionExpiresAt: { $gte: now },
  });

  const dbStatus =
    !dbReady
      ? 'down'
      : avgResponseTime > 300 || errorRate > 5
        ? 'degraded'
        : 'healthy';

  const userGrowthMap = new Map(
    userGrowthTrendRaw.map((item) => [
      toDateKey(startOfWeek(new Date(item.createdAt))),
      item.count,
    ]),
  );
  const userGrowthTrend = Array.from({ length: 12 }, (_, index) => {
    const weekStart = addWeeks(lastTwelveWeeksStart, index);
    return {
      week: formatWeekLabel(weekStart),
      count: userGrowthMap.get(toDateKey(weekStart)) ?? 0,
    };
  });

  const auditTrendMap = new Map(
    auditTrendRaw.map((item) => [toDateKey(new Date(item.createdAt)), item.count]),
  );
  const auditTrend = Array.from({ length: 14 }, (_, index) => {
    const day = addDays(last14DaysStart, index);
    return {
      date: formatDayLabel(day),
      count: auditTrendMap.get(toDateKey(day)) ?? 0,
    };
  });

  const systemErrorTrendMap = new Map(
    systemErrorTrendRaw.map((item) => [
      `${new Date(item.createdAt).getFullYear()}-${new Date(item.createdAt).getMonth()}-${new Date(item.createdAt).getDate()}-${new Date(item.createdAt).getHours()}`,
      item,
    ]),
  );
  const systemErrorTrend = Array.from({ length: 24 }, (_, index) => {
    const bucket = new Date(last24HoursBucketStart.getTime() + index * 60 * 60 * 1000);
    const key = `${bucket.getFullYear()}-${bucket.getMonth()}-${bucket.getDate()}-${bucket.getHours()}`;
    const found = systemErrorTrendMap.get(key);

    return {
      hour: formatHourLabel(bucket),
      errors: found?.errors ?? 0,
      requests: found?.requests ?? 0,
    };
  });

  const revenueTrendMap = new Map(
    revenueTrendRaw.map((item) => [
      `${new Date(item.periodStart).getFullYear()}-${new Date(item.periodStart).getMonth()}`,
      item.revenue,
    ]),
  );
  const revenueTrend = Array.from({ length: 12 }, (_, index) => {
    const month = addMonths(lastTwelveMonthsStart, index);
    const key = `${month.getFullYear()}-${month.getMonth()}`;

    return {
      month: formatMonthLabel(month),
      revenue: revenueTrendMap.get(key) ?? 0,
    };
  });

  const interviewsByMonthMap = new Map(
    interviewsByMonthRaw.map((item) => [
      `${new Date(item.monthStart).getFullYear()}-${new Date(item.monthStart).getMonth()}`,
      item.count,
    ]),
  );
  const interviewsByMonth = Array.from({ length: 6 }, (_, index) => {
    const month = addMonths(lastSixMonthsStart, index);
    const key = `${month.getFullYear()}-${month.getMonth()}`;

    return {
      month: formatMonthLabel(month),
      count: interviewsByMonthMap.get(key) ?? 0,
    };
  });

  const riskDistributionMap = new Map(
    riskDistributionRaw.map((item) => [item.level, item.count]),
  );
  const riskDistribution = riskOrder.map((level) => ({
    level,
    count: riskDistributionMap.get(level) ?? 0,
  }));

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

  const securityCategoryMap = new Map(
    securityCategoryBreakdownRaw.map((item) => [item.category, item.avgCompliance]),
  );
  const securityCategoryBreakdown = securityCategoryOrder.map((category) => ({
    category,
    avgCompliance: securityCategoryMap.get(category) ?? 0,
  }));

  const subscriptionMap = new Map(
    subscriptionBreakdownRaw.map((item) => [item.plan, item]),
  );
  const subscriptionBreakdown = subscriptionPlanOrder.map((plan) => ({
    plan,
    count: subscriptionMap.get(plan)?.count ?? 0,
    revenue: subscriptionMap.get(plan)?.revenue ?? 0,
  }));

  const orgStatusMap = new Map(
    orgsByStatusRaw.map((item) => [item.status, item.count]),
  );
  const orgsByStatus = organizationStatusOrder.map((status) => ({
    status,
    count: orgStatusMap.get(status) ?? 0,
  }));

  const recentActivity = [
    ...recentUsersRaw.map((item) => ({
      type: 'user' as const,
      title: item.name,
      description: `${item.email} joined the platform`,
      timestamp: item.createdAt.toISOString(),
      icon: '👤',
    })),
    ...recentOrganizationsRaw.map((item) => ({
      type: 'organization' as const,
      title: item.name,
      description: `${item.industry} organization created`,
      timestamp: item.createdAt.toISOString(),
      icon: '🏢',
    })),
    ...recentAssessmentsRaw.map((item) => ({
      type: 'assessment' as const,
      title: `Assessment for ${item.organizationName}`,
      description: `Readiness score recorded at ${round1(item.overallScore).toFixed(1)}%`,
      timestamp: item.createdAt.toISOString(),
      icon: '📊',
    })),
    ...recentInterviewsRaw.map((item) => ({
      type: 'interview' as const,
      title: item.intervieweeName,
      description: `Interview captured for ${item.organizationName}`,
      timestamp: item.date.toISOString(),
      icon: '🎤',
    })),
    ...recentCaseStudiesRaw.map((item) => ({
      type: 'casestudy' as const,
      title: item.title,
      description: `${item.organization} case study published`,
      timestamp: item.createdAt.toISOString(),
      icon: '📚',
    })),
    ...recentSecurityChecksRaw.map((item) => ({
      type: 'security' as const,
      title: `Security review for ${item.organizationName}`,
      description: `${item.overallRisk} risk posture recorded`,
      timestamp: item.createdAt.toISOString(),
      icon: '🔒',
    })),
    ...recentAuditLogsRaw.slice(0, 5).map((item) => ({
      type: 'audit' as const,
      title: `${item.user} · ${item.action}`,
      description: `${item.resource || 'System'} from ${item.ip || 'unknown IP'}`,
      timestamp: item.timestamp.toISOString(),
      icon: '🧾',
      severity: item.severity,
    })),
  ]
    .sort(
      (left, right) =>
        new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime(),
    )
    .slice(0, 20);

  return {
    totalUsers,
    activeUsers,
    newUsersThisMonth,
    pendingApprovals,
    suspendedUsers,
    adminCount,
    usersByRole: usersByRoleRaw,
    userGrowthTrend,
    userActivityHeatmap: userActivityHeatmapRaw,
    totalOrganizations,
    totalAssessments,
    totalInterviews,
    totalCaseStudies,
    totalSecurityChecks,
    platformAverageReadiness: platformAverageReadinessRaw[0]?.avgScore ?? 0,
    highRiskOrganizations: highRiskOrganizationsRaw[0]?.count ?? 0,
    assessmentsThisMonth,
    totalAuditEvents,
    auditEventsToday,
    failedLoginAttempts,
    criticalAlerts,
    auditEventsByType: auditEventsByTypeRaw,
    auditTrend,
    recentAuditLogs: recentAuditLogsRaw.map((item) => ({
      ...item,
      timestamp: item.timestamp.toISOString(),
    })),
    systemHealth: {
      dbStatus,
      apiResponseTimeMs: avgResponseTime,
      errorRate,
      uptime,
      totalApiRequests: requestsToday,
      activeSessionCount,
    },
    systemErrorTrend,
    subscriptionBreakdown,
    totalMonthlyRevenue: totalMonthlyRevenueRaw[0]?.revenue ?? 0,
    revenueGrowth,
    churnedSubscriptions,
    trialConversions,
    revenueTrend,
    orgsByStatus,
    topOrganizationsByActivity: topOrganizationsByActivityRaw.map((item) => ({
      ...item,
      lastActivity: new Date(item.lastActivity).toISOString(),
    })),
    inactiveOrganizations: inactiveOrganizationsRaw.map((item) => ({
      ...item,
      lastActivity: new Date(item.lastActivity).toISOString(),
    })),
    scoresByIndustry: scoresByIndustryRaw,
    riskDistribution,
    categoryAverages,
    orgSizeDistribution,
    caseStudiesBySector: caseStudiesBySectorRaw,
    securityCategoryBreakdown,
    interviewsByMonth,
    monthlyGrowth: {
      users: usersGrowth,
      organizations: organizationsGrowth,
      assessments: assessmentsGrowth,
      interviews: interviewsGrowth,
      revenue: revenueGrowth,
    },
    recentActivity,
    topUsers: topUsersRaw.map((user) => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status ?? 'active',
      lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt).toISOString() : null,
    })),
    generatedAt: now.toISOString(),
  };
}

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    if (!isAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    await dbConnect();

    const data = await buildAdminStats();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Admin stats GET error:', error);

    return NextResponse.json(
      { error: 'Failed to fetch admin data.' },
      { status: 500 },
    );
  }
}
