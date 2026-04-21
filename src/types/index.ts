export type UserRole = 'admin' | 'viewer';
export type OrganizationSize = 'startup' | 'sme' | 'enterprise';
export type AssessmentStatus =
  | 'not-ready'
  | 'partially-ready'
  | 'mostly-ready'
  | 'cloud-ready';

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface OrganizationFormValues {
  name: string;
  industry: string;
  size: OrganizationSize;
  sector: string;
  address: string;
  contactPerson: string;
  email: string;
  phone: string;
  logoUrl: string;
}

export interface OrganizationListItem extends OrganizationFormValues {
  id: string;
  createdAt: string;
  assessmentCount?: number;
}

export interface AssessmentQuestionScore {
  id: string;
  prompt: string;
  score: number;
}

export interface AssessmentCategoryScore {
  key: string;
  name: string;
  weight: number;
  rawScore: number;
  averageScore: number;
  percentageScore: number;
  weightedScore: number;
  questions: AssessmentQuestionScore[];
}

export interface AssessmentListItem {
  id: string;
  organizationId: string;
  organizationName: string;
  overallScore: number;
  status: AssessmentStatus;
  statusLabel: string;
  statusColor: string;
  recommendation: string;
  createdAt: string;
}

export interface AssessmentDetail extends AssessmentListItem {
  assessor?: UserSummary | null;
  categories: AssessmentCategoryScore[];
}

export interface InterviewResponse {
  question: string;
  answer: string;
}

export interface InterviewFormValues {
  orgId: string;
  intervieweeName: string;
  designation: string;
  department: string;
  experience: string;
  responses: InterviewResponse[];
  fileUrl: string;
}

export interface InterviewListItem {
  id: string;
  orgId: string;
  organizationName: string;
  intervieweeName: string;
  designation: string;
  department: string;
  experience: string;
  date: string;
  conductedBy?: UserSummary | null;
}

export interface InterviewDetail extends InterviewListItem {
  responses: InterviewResponse[];
  fileUrl: string;
}

export interface CaseStudyFormValues {
  title: string;
  organization: string;
  sector: string;
  challenge: string;
  solution: string;
  outcome: string;
  results: string;
  tags: string[];
  fileUrl: string;
}

export interface CaseStudyListItem extends CaseStudyFormValues {
  id: string;
  createdAt: string;
  uploadedBy?: UserSummary | null;
}

export interface SecurityChecklistItem {
  category: string;
  item: string;
  status: 'compliant' | 'partial' | 'non-compliant';
  notes: string;
}

export interface SecurityAssessmentFormValues {
  orgId: string;
  checklist: SecurityChecklistItem[];
}

export interface SecurityCategoryBreakdown {
  category: string;
  score: number;
  maxScore: number;
  compliantCount: number;
  partialCount: number;
  nonCompliantCount: number;
}

export interface SecurityAssessmentListItem {
  id: string;
  orgId: string;
  organizationName: string;
  score: number;
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  conductedBy?: UserSummary | null;
}

export interface SecurityAssessmentDetail extends SecurityAssessmentListItem {
  checklist: SecurityChecklistItem[];
  findings: string[];
  recommendations: string[];
  categoryBreakdown: SecurityCategoryBreakdown[];
  actionItems: string[];
}
