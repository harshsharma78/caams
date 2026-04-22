export type DashboardRiskLevel =
  | 'low'
  | 'medium'
  | 'high'
  | 'critical'
  | 'unknown';

export type DashboardActivityType =
  | 'assessment'
  | 'interview'
  | 'casestudy'
  | 'security'
  | 'organization';

export interface ScoresByIndustryItem {
  industry: string;
  avgScore: number;
  count: number;
}

export interface RiskDistributionItem {
  level: DashboardRiskLevel;
  count: number;
}

export interface AssessmentsTrendItem {
  week: string;
  count: number;
}

export interface CategoryAverageItem {
  category: string;
  avgScore: number;
}

export interface OrgSizeDistributionItem {
  size: 'startup' | 'sme' | 'enterprise';
  count: number;
}

export interface TopOrganizationItem {
  name: string;
  score: number;
  risk: DashboardRiskLevel;
}

export interface InterviewsByMonthItem {
  month: string;
  count: number;
}

export interface CaseStudiesBySectorItem {
  sector: string;
  count: number;
}

export interface SecurityCategoryBreakdownItem {
  category: string;
  avgCompliance: number;
}

export interface RecentActivityItem {
  type: DashboardActivityType;
  title: string;
  description: string;
  timestamp: string;
  icon: string;
}

export interface DashboardMonthlyGrowth {
  organizations: number;
  assessments: number;
  interviews: number;
  caseStudies: number;
  securityChecks: number;
  averageReadinessScore: number;
  highRiskAlerts: number;
  assessmentsThisMonth: number;
}

export interface DashboardStatsResponse {
  totalOrganizations: number;
  totalAssessments: number;
  totalInterviews: number;
  totalCaseStudies: number;
  totalSecurityChecks: number;
  averageReadinessScore: number;
  highRiskAlerts: number;
  assessmentsThisMonth: number;
  scoresByIndustry: ScoresByIndustryItem[];
  riskDistribution: RiskDistributionItem[];
  assessmentsTrend: AssessmentsTrendItem[];
  categoryAverages: CategoryAverageItem[];
  orgSizeDistribution: OrgSizeDistributionItem[];
  topOrganizations: TopOrganizationItem[];
  interviewsByMonth: InterviewsByMonthItem[];
  caseStudiesBySector: CaseStudiesBySectorItem[];
  securityCategoryBreakdown: SecurityCategoryBreakdownItem[];
  recentActivity: RecentActivityItem[];
  monthlyGrowth: DashboardMonthlyGrowth;
  generatedAt: string;
}
