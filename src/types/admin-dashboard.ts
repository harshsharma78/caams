export type AdminAuditSeverity = 'info' | 'warning' | 'critical';
export type AdminRiskLevel =
  | 'low'
  | 'medium'
  | 'high'
  | 'critical'
  | 'unknown';
export type AdminUserRole =
  | 'admin'
  | 'analyst'
  | 'viewer'
  | 'org_manager';
export type AdminUserStatus = 'active' | 'pending' | 'suspended';
export type AdminOrganizationStatus =
  | 'active'
  | 'inactive'
  | 'suspended'
  | 'trial';
export type AdminSubscriptionPlan =
  | 'free'
  | 'starter'
  | 'professional'
  | 'enterprise';

export interface AdminRoleCount {
  role: string;
  count: number;
}

export interface AdminWeekCount {
  week: string;
  count: number;
}

export interface AdminHeatmapCell {
  day: string;
  hour: number;
  count: number;
}

export interface AdminAuditTypeCount {
  type: string;
  count: number;
}

export interface AdminAuditTrendPoint {
  date: string;
  count: number;
}

export interface AdminRecentAuditLog {
  user: string;
  action: string;
  resource: string;
  ip: string;
  timestamp: string;
  severity: AdminAuditSeverity;
}

export interface AdminSystemHealth {
  dbStatus: 'healthy' | 'degraded' | 'down';
  apiResponseTimeMs: number;
  errorRate: number;
  uptime: number;
  totalApiRequests: number;
  activeSessionCount: number;
}

export interface AdminSystemErrorTrendPoint {
  hour: string;
  errors: number;
  requests: number;
}

export interface AdminSubscriptionBreakdownItem {
  plan: string;
  count: number;
  revenue: number;
}

export interface AdminRevenueTrendPoint {
  month: string;
  revenue: number;
}

export interface AdminOrganizationStatusCount {
  status: string;
  count: number;
}

export interface AdminTopOrganizationItem {
  name: string;
  industry: string;
  assessmentCount: number;
  latestScore: number;
  riskLevel: string;
  plan: string;
  lastActivity: string;
}

export interface AdminInactiveOrganizationItem {
  name: string;
  lastActivity: string;
  daysSinceActivity: number;
}

export interface AdminScoresByIndustryItem {
  industry: string;
  avgScore: number;
  count: number;
}

export interface AdminRiskDistributionItem {
  level: string;
  count: number;
}

export interface AdminCategoryAverageItem {
  category: string;
  avgScore: number;
}

export interface AdminOrgSizeDistributionItem {
  size: string;
  count: number;
}

export interface AdminCaseStudiesBySectorItem {
  sector: string;
  count: number;
}

export interface AdminSecurityCategoryBreakdownItem {
  category: string;
  avgCompliance: number;
}

export interface AdminInterviewsByMonthItem {
  month: string;
  count: number;
}

export interface AdminMonthlyGrowth {
  users: number;
  organizations: number;
  assessments: number;
  interviews: number;
  revenue: number;
}

export interface AdminRecentActivityItem {
  type:
    | 'assessment'
    | 'interview'
    | 'casestudy'
    | 'security'
    | 'organization'
    | 'user'
    | 'audit';
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  severity?: AdminAuditSeverity;
}

export interface AdminUserTableItem {
  id: string;
  name: string;
  email: string;
  role: AdminUserRole | string;
  status: AdminUserStatus | string;
  lastLoginAt: string | null;
}

export interface AdminDashboardData {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  pendingApprovals: number;
  suspendedUsers: number;
  adminCount: number;
  usersByRole: AdminRoleCount[];
  userGrowthTrend: AdminWeekCount[];
  userActivityHeatmap: AdminHeatmapCell[];
  totalOrganizations: number;
  totalAssessments: number;
  totalInterviews: number;
  totalCaseStudies: number;
  totalSecurityChecks: number;
  platformAverageReadiness: number;
  highRiskOrganizations: number;
  assessmentsThisMonth: number;
  totalAuditEvents: number;
  auditEventsToday: number;
  failedLoginAttempts: number;
  criticalAlerts: number;
  auditEventsByType: AdminAuditTypeCount[];
  auditTrend: AdminAuditTrendPoint[];
  recentAuditLogs: AdminRecentAuditLog[];
  systemHealth: AdminSystemHealth;
  systemErrorTrend: AdminSystemErrorTrendPoint[];
  subscriptionBreakdown: AdminSubscriptionBreakdownItem[];
  totalMonthlyRevenue: number;
  revenueGrowth: number;
  churnedSubscriptions: number;
  trialConversions: number;
  revenueTrend: AdminRevenueTrendPoint[];
  orgsByStatus: AdminOrganizationStatusCount[];
  topOrganizationsByActivity: AdminTopOrganizationItem[];
  inactiveOrganizations: AdminInactiveOrganizationItem[];
  scoresByIndustry: AdminScoresByIndustryItem[];
  riskDistribution: AdminRiskDistributionItem[];
  categoryAverages: AdminCategoryAverageItem[];
  orgSizeDistribution: AdminOrgSizeDistributionItem[];
  caseStudiesBySector: AdminCaseStudiesBySectorItem[];
  securityCategoryBreakdown: AdminSecurityCategoryBreakdownItem[];
  interviewsByMonth: AdminInterviewsByMonthItem[];
  monthlyGrowth: AdminMonthlyGrowth;
  recentActivity: AdminRecentActivityItem[];
  topUsers: AdminUserTableItem[];
  generatedAt: string;
}
