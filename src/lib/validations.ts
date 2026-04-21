import { z } from 'zod';
import { SECURITY_CHECKLIST_TEMPLATES } from '@/lib/securityEngine';

const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email is required.')
  .email('Enter a valid email address.');

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters.')
  .max(64, 'Password must be 64 characters or fewer.')
  .regex(/[A-Z]/, 'Password must include at least one uppercase letter.')
  .regex(/[a-z]/, 'Password must include at least one lowercase letter.')
  .regex(/\d/, 'Password must include at least one number.');

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters.')
    .max(60, 'Name must be 60 characters or fewer.'),
  email: emailSchema,
  password: passwordSchema,
  role: z.enum(['admin', 'viewer']),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required.').max(64),
});

export const organizationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Organization is required.')
    .max(100, 'Organization must be 100 characters or fewer.'),
  industry: z
    .string()
    .trim()
    .min(2, 'Industry is required.')
    .max(60, 'Industry must be 60 characters or fewer.'),
  size: z.enum(['startup', 'sme', 'enterprise']),
  sector: z
    .string()
    .trim()
    .min(2, 'Sector is required.')
    .max(60, 'Sector must be 60 characters or fewer.'),
  address: z
    .string()
    .trim()
    .min(5, 'Address is required.')
    .max(200, 'Address must be 200 characters or fewer.'),
  contactPerson: z
    .string()
    .trim()
    .min(2, 'Contact Name is required.')
    .max(60, 'Contact name must be 60 characters or fewer.'),
  email: emailSchema,
  phone: z
    .string()
    .trim()
    .min(7, 'Phone Number is required.')
    .max(10, 'Phone number must be 10 characters or fewer.')
    .regex(/^[+\d\s()-]+$/, 'Enter a valid phone number.'),
  logoUrl: z.url('Logo URL must be valid.').or(z.literal('')).default(''),
});

export const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ID.');

export const CASE_STUDY_SECTORS = [
  'Healthcare',
  'Finance',
  'Education',
  'Retail',
  'Government',
  'Manufacturing',
  'Logistics',
  'Technology',
  'Other',
] as const;

export const SECURITY_STATUS_VALUES = [
  'compliant',
  'partial',
  'non-compliant',
] as const;

export const SECURITY_RISK_LEVELS = [
  'low',
  'medium',
  'high',
  'critical',
] as const;

export const caseStudySchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Title must be at least 3 characters.')
    .max(120, 'Title must be 120 characters or fewer.'),
  organization: z
    .string()
    .trim()
    .min(2, 'Organization must be at least 2 characters.')
    .max(100, 'Organization must be 100 characters or fewer.'),
  sector: z.enum(CASE_STUDY_SECTORS, {
    error: 'Select a valid sector.',
  }),
  challenge: z
    .string()
    .trim()
    .min(20, 'Challenge must be at least 20 characters.')
    .max(5000, 'Challenge must be 5000 characters or fewer.'),
  solution: z
    .string()
    .trim()
    .min(20, 'Solution must be at least 20 characters.')
    .max(5000, 'Solution must be 5000 characters or fewer.'),
  outcome: z
    .string()
    .trim()
    .min(20, 'Outcome must be at least 20 characters.')
    .max(5000, 'Outcome must be 5000 characters or fewer.'),
  results: z
    .string()
    .trim()
    .min(10, 'Results must be at least 10 characters.')
    .max(2000, 'Results must be 2000 characters or fewer.'),
  tags: z
    .array(
      z
        .string()
        .trim()
        .min(1, 'Tag cannot be empty.')
        .max(30, 'Tags must be 30 characters or fewer.'),
    )
    .max(12, 'Use 12 tags or fewer.')
    .default([]),
  fileUrl: z.url('File URL must be valid.').or(z.literal('')).default(''),
});

const securityChecklistItemSchema = z.object({
  category: z
    .string()
    .trim()
    .min(2, 'Category is required.')
    .max(80, 'Category must be 80 characters or fewer.'),
  item: z
    .string()
    .trim()
    .min(2, 'Checklist item is required.')
    .max(200, 'Checklist item must be 200 characters or fewer.'),
  status: z.enum(SECURITY_STATUS_VALUES, {
    error: 'Select a valid compliance status.',
  }),
  notes: z
    .string()
    .trim()
    .max(2000, 'Notes must be 2000 characters or fewer.')
    .default(''),
});

export const securityAssessmentSchema = z.object({
  orgId: objectIdSchema,
  checklist: z
    .array(securityChecklistItemSchema)
    .length(30, 'The security assessment must include 30 checklist items.'),
}).superRefine((value, context) => {
  const expectedEntries = SECURITY_CHECKLIST_TEMPLATES.flatMap((category) =>
    category.items.map((item) => `${category.category}:::${item.item}`),
  );

  const receivedEntries = value.checklist.map(
    (item) => `${item.category}:::${item.item}`,
  );

  expectedEntries.forEach((entry, index) => {
    if (!receivedEntries.includes(entry)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['checklist', index],
        message: 'Checklist items do not match the required template.',
      });
    }
  });
});

export const assessmentCategoryKeys = [
  'infrastructure-readiness',
  'security-compliance',
  'application-portability',
  'data-management',
  'team-skills-readiness',
  'cost-roi-analysis',
] as const;

export const assessmentQuestionIdsByCategory = {
  'infrastructure-readiness': [
    'infra-inventory',
    'infra-virtualization',
    'infra-networking',
    'infra-monitoring',
    'infra-automation',
  ],
  'security-compliance': [
    'security-iam',
    'security-compliance-controls',
    'security-data-protection',
    'security-incident-response',
    'security-vulnerability-management',
  ],
  'application-portability': [
    'app-architecture',
    'app-dependencies',
    'app-containerization',
    'app-ci-cd',
    'app-testing',
  ],
  'data-management': [
    'data-classification',
    'data-backup-recovery',
    'data-integration',
    'data-governance',
    'data-performance',
  ],
  'team-skills-readiness': [
    'team-cloud-skills',
    'team-change-management',
    'team-ownership',
    'team-training',
    'team-executive-support',
  ],
  'cost-roi-analysis': [
    'cost-baseline',
    'cost-finops',
    'cost-business-case',
    'cost-kpi-tracking',
    'cost-risk-planning',
  ],
} as const;

const assessmentQuestionResponseSchema = z.object({
  id: z.string().trim().min(1, 'Question ID is required.'),
  score: z
    .number({
      error: 'Question score is required.',
    })
    .int('Question score must be a whole number.')
    .min(1, 'Question score must be between 1 and 5.')
    .max(5, 'Question score must be between 1 and 5.'),
});

const assessmentCategoryResponseSchema = z.object({
  key: z.enum(assessmentCategoryKeys),
  questions: z
    .array(assessmentQuestionResponseSchema)
    .length(5, 'Each category must include 5 scored questions.'),
});

export const assessmentInputSchema = z
  .object({
    orgId: objectIdSchema,
    categories: z
      .array(assessmentCategoryResponseSchema)
      .length(6, 'The assessment must include all 6 categories.'),
  })
  .superRefine((value, context) => {
    const categorySet = new Set<string>();

    value.categories.forEach((category, categoryIndex) => {
      if (categorySet.has(category.key)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['categories', categoryIndex, 'key'],
          message: 'Duplicate category provided.',
        });
        return;
      }

      categorySet.add(category.key);

      const expectedQuestionIds = assessmentQuestionIdsByCategory[category.key];
      const questionSet = new Set<string>();

      category.questions.forEach((question, questionIndex) => {
        if (!expectedQuestionIds.includes(question.id as never)) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: [
              'categories',
              categoryIndex,
              'questions',
              questionIndex,
              'id',
            ],
            message: 'Unexpected question for category.',
          });
        }

        if (questionSet.has(question.id)) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: [
              'categories',
              categoryIndex,
              'questions',
              questionIndex,
              'id',
            ],
            message: 'Duplicate question provided.',
          });
        }

        questionSet.add(question.id);
      });

      expectedQuestionIds.forEach((questionId) => {
        if (!questionSet.has(questionId)) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['categories', categoryIndex, 'questions'],
            message: `Missing question response: ${questionId}.`,
          });
        }
      });
    });

    assessmentCategoryKeys.forEach((key) => {
      if (!categorySet.has(key)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['categories'],
          message: `Missing category response: ${key}.`,
        });
      }
    });
  });

export const STANDARD_INTERVIEW_QUESTIONS = [
  'What is your current IT infrastructure setup?',
  'Has your organization adopted any cloud services? If yes, which ones?',
  'What were the primary drivers for cloud adoption?',
  'What challenges did you face during/before cloud migration?',
  'How does your organization handle data security in the cloud?',
  'What compliance requirements do you need to meet?',
  'How has cloud adoption impacted operational costs?',
  'What skills gaps exist in your team regarding cloud technologies?',
  'What would you recommend to organizations planning cloud adoption?',
  'What are the biggest misconceptions about cloud computing in your industry?',
] as const;

const interviewResponseSchema = z.object({
  question: z.string().trim().min(1, 'Question is required.'),
  answer: z.string().trim().default(''),
});

export const interviewSchema = z.object({
  orgId: objectIdSchema,
  intervieweeName: z
    .string()
    .trim()
    .min(2, 'Interviewee name must be at least 2 characters.')
    .max(100, 'Interviewee name must be 100 characters or fewer.'),
  designation: z
    .string()
    .trim()
    .min(2, 'Designation is required.')
    .max(100, 'Designation must be 100 characters or fewer.'),
  department: z
    .string()
    .trim()
    .min(2, 'Department is required.')
    .max(100, 'Department must be 100 characters or fewer.'),
  experience: z
    .string()
    .trim()
    .min(1, 'Years of experience is required.')
    .max(50, 'Experience must be 50 characters or fewer.'),
  responses: z
    .array(interviewResponseSchema)
    .length(10, 'All 10 interview questions must be included.'),
  fileUrl: z.url('File URL must be valid.').or(z.literal('')).default(''),
});
