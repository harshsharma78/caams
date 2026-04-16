import { z } from 'zod';

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
    .min(2, 'Organization name is required.')
    .max(100, 'Organization name must be 100 characters or fewer.'),
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
    .min(2, 'Contact person is required.')
    .max(60, 'Contact person must be 60 characters or fewer.'),
  email: emailSchema,
  phone: z
    .string()
    .trim()
    .min(7, 'Phone number is required.')
    .max(20, 'Phone number must be 20 characters or fewer.')
    .regex(/^[+\d\s()-]+$/, 'Enter a valid phone number.'),
  logoUrl: z.url('Logo URL must be valid.').or(z.literal('')).default(''),
});

export const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ID.');

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
