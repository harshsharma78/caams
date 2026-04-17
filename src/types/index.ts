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
