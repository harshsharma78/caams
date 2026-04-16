import {
  assessmentCategoryKeys,
  assessmentQuestionIdsByCategory,
} from '@/lib/validations';

export type AssessmentCategoryKey = (typeof assessmentCategoryKeys)[number];
export type AssessmentStatus =
  | 'not-ready'
  | 'partially-ready'
  | 'mostly-ready'
  | 'cloud-ready';

export interface AssessmentQuestionDefinition {
  id: string;
  prompt: string;
}

export interface AssessmentCategoryDefinition {
  key: AssessmentCategoryKey;
  name: string;
  weight: number;
  questions: AssessmentQuestionDefinition[];
}

export interface AssessmentQuestionInput {
  id: string;
  score: number;
}

export interface AssessmentCategoryInput {
  key: AssessmentCategoryKey;
  questions: AssessmentQuestionInput[];
}

export interface AssessmentQuestionResult extends AssessmentQuestionDefinition {
  score: number;
}

export interface AssessmentCategoryResult {
  key: AssessmentCategoryKey;
  name: string;
  weight: number;
  rawScore: number;
  averageScore: number;
  percentageScore: number;
  weightedScore: number;
  questions: AssessmentQuestionResult[];
}

export interface ScoreInterpretation {
  label: string;
  status: AssessmentStatus;
  color: string;
  badgeClassName: string;
}

const recommendationMap: Record<AssessmentCategoryKey, string> = {
  'application-portability':
    'Reduce migration friction by isolating hard-coded dependencies, standardizing deployment pipelines, and containerizing priority workloads.',
  'cost-roi-analysis':
    'Strengthen the cloud business case with baseline spend visibility, defined ROI targets, and a FinOps review cadence before broad migration.',
  'data-management':
    'Prioritize data classification, backup validation, and integration design so critical datasets can move without governance or availability gaps.',
  'infrastructure-readiness':
    'Focus on inventory accuracy, network landing zone design, observability, and repeatable infrastructure automation before scaling migration work.',
  'security-compliance':
    'Close identity, encryption, and incident-response gaps first so security controls are embedded in the migration plan rather than added afterward.',
  'team-skills-readiness':
    'Invest in role-based cloud training, ownership clarity, and executive sponsorship so the delivery team can absorb new operating models.',
};

export const ASSESSMENT_CATEGORIES: AssessmentCategoryDefinition[] = [
  {
    key: 'infrastructure-readiness',
    name: 'Infrastructure Readiness',
    weight: 20,
    questions: [
      {
        id: assessmentQuestionIdsByCategory['infrastructure-readiness'][0],
        prompt:
          'How complete is your inventory of current servers, workloads, and dependencies?',
      },
      {
        id: assessmentQuestionIdsByCategory['infrastructure-readiness'][1],
        prompt:
          'How mature is your use of virtualization or abstraction for existing infrastructure?',
      },
      {
        id: assessmentQuestionIdsByCategory['infrastructure-readiness'][2],
        prompt:
          'How prepared are your network architecture and connectivity plans for cloud integration?',
      },
      {
        id: assessmentQuestionIdsByCategory['infrastructure-readiness'][3],
        prompt:
          'How mature are your monitoring, logging, and alerting capabilities today?',
      },
      {
        id: assessmentQuestionIdsByCategory['infrastructure-readiness'][4],
        prompt:
          'How consistently do you use infrastructure automation and configuration management?',
      },
    ],
  },
  {
    key: 'security-compliance',
    name: 'Security & Compliance',
    weight: 20,
    questions: [
      {
        id: assessmentQuestionIdsByCategory['security-compliance'][0],
        prompt:
          'How strong are your identity, access control, and least-privilege practices?',
      },
      {
        id: assessmentQuestionIdsByCategory['security-compliance'][1],
        prompt:
          'How well defined are your compliance controls and audit requirements for regulated workloads?',
      },
      {
        id: assessmentQuestionIdsByCategory['security-compliance'][2],
        prompt:
          'How mature are your encryption, key management, and sensitive data protection controls?',
      },
      {
        id: assessmentQuestionIdsByCategory['security-compliance'][3],
        prompt:
          'How ready is your incident response process for cloud environments?',
      },
      {
        id: assessmentQuestionIdsByCategory['security-compliance'][4],
        prompt:
          'How consistently do you perform vulnerability management and remediation?',
      },
    ],
  },
  {
    key: 'application-portability',
    name: 'Application Portability',
    weight: 15,
    questions: [
      {
        id: assessmentQuestionIdsByCategory['application-portability'][0],
        prompt:
          'How modular and cloud-compatible is your current application architecture?',
      },
      {
        id: assessmentQuestionIdsByCategory['application-portability'][1],
        prompt:
          'How well understood are external dependencies, integrations, and legacy constraints?',
      },
      {
        id: assessmentQuestionIdsByCategory['application-portability'][2],
        prompt:
          'How mature is your use of containers or other portable deployment patterns?',
      },
      {
        id: assessmentQuestionIdsByCategory['application-portability'][3],
        prompt:
          'How reliable are your CI/CD pipelines for repeatable deployments?',
      },
      {
        id: assessmentQuestionIdsByCategory['application-portability'][4],
        prompt:
          'How complete is your automated testing coverage for migration-sensitive applications?',
      },
    ],
  },
  {
    key: 'data-management',
    name: 'Data Management',
    weight: 15,
    questions: [
      {
        id: assessmentQuestionIdsByCategory['data-management'][0],
        prompt:
          'How clearly have you classified data by sensitivity, criticality, and residency requirements?',
      },
      {
        id: assessmentQuestionIdsByCategory['data-management'][1],
        prompt:
          'How strong are your backup, recovery, and restore validation processes?',
      },
      {
        id: assessmentQuestionIdsByCategory['data-management'][2],
        prompt:
          'How prepared are your data integration and synchronization patterns for hybrid operation?',
      },
      {
        id: assessmentQuestionIdsByCategory['data-management'][3],
        prompt:
          'How mature are your data governance and stewardship processes?',
      },
      {
        id: assessmentQuestionIdsByCategory['data-management'][4],
        prompt:
          'How confident are you in database performance, scalability, and migration planning?',
      },
    ],
  },
  {
    key: 'team-skills-readiness',
    name: 'Team & Skills Readiness',
    weight: 15,
    questions: [
      {
        id: assessmentQuestionIdsByCategory['team-skills-readiness'][0],
        prompt:
          'How prepared is your team with foundational cloud architecture and operations skills?',
      },
      {
        id: assessmentQuestionIdsByCategory['team-skills-readiness'][1],
        prompt:
          'How ready is the organization for process and operating-model change during migration?',
      },
      {
        id: assessmentQuestionIdsByCategory['team-skills-readiness'][2],
        prompt:
          'How clear are ownership, accountability, and cross-functional collaboration for cloud initiatives?',
      },
      {
        id: assessmentQuestionIdsByCategory['team-skills-readiness'][3],
        prompt:
          'How structured is your enablement plan for training, mentoring, and certification?',
      },
      {
        id: assessmentQuestionIdsByCategory['team-skills-readiness'][4],
        prompt:
          'How strong is executive sponsorship for the cloud transformation program?',
      },
    ],
  },
  {
    key: 'cost-roi-analysis',
    name: 'Cost & ROI Analysis',
    weight: 15,
    questions: [
      {
        id: assessmentQuestionIdsByCategory['cost-roi-analysis'][0],
        prompt:
          'How well established is your baseline view of current infrastructure and operating costs?',
      },
      {
        id: assessmentQuestionIdsByCategory['cost-roi-analysis'][1],
        prompt:
          'How mature are your FinOps practices for forecasting, tagging, and spend governance?',
      },
      {
        id: assessmentQuestionIdsByCategory['cost-roi-analysis'][2],
        prompt:
          'How credible is your migration business case and expected return on investment?',
      },
      {
        id: assessmentQuestionIdsByCategory['cost-roi-analysis'][3],
        prompt:
          'How clearly have you defined KPIs to track value realization after migration?',
      },
      {
        id: assessmentQuestionIdsByCategory['cost-roi-analysis'][4],
        prompt:
          'How well prepared are you for migration risks, contingencies, and cost overruns?',
      },
    ],
  },
];

function roundScore(value: number) {
  return Math.round(value * 10) / 10;
}

export function getScoreInterpretation(score: number): ScoreInterpretation {
  if (score <= 40) {
    return {
      label: 'Not Ready',
      status: 'not-ready',
      color: 'bg-rose-500',
      badgeClassName:
        'border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300',
    };
  }

  if (score <= 60) {
    return {
      label: 'Partially Ready',
      status: 'partially-ready',
      color: 'bg-orange-500',
      badgeClassName:
        'border border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-950 dark:text-orange-300',
    };
  }

  if (score <= 80) {
    return {
      label: 'Mostly Ready',
      status: 'mostly-ready',
      color: 'bg-amber-400',
      badgeClassName:
        'border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300',
    };
  }

  return {
    label: 'Cloud Ready',
    status: 'cloud-ready',
    color: 'bg-emerald-500',
    badgeClassName:
      'border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300',
  };
}

export function calculateWeightedScores(categories: AssessmentCategoryInput[]) {
  const categoryResults: AssessmentCategoryResult[] = ASSESSMENT_CATEGORIES.map(
    (definition) => {
      const inputCategory = categories.find(
        (category) => category.key === definition.key,
      );

      if (!inputCategory) {
        throw new Error(`Missing assessment category: ${definition.key}`);
      }

      const questions = definition.questions.map((questionDefinition) => {
        const inputQuestion = inputCategory.questions.find(
          (question) => question.id === questionDefinition.id,
        );

        if (!inputQuestion) {
          throw new Error(
            `Missing score for question: ${questionDefinition.id}`,
          );
        }

        return {
          ...questionDefinition,
          score: inputQuestion.score,
        };
      });

      const rawScore = questions.reduce(
        (total, question) => total + question.score,
        0,
      );
      const averageScore = roundScore(rawScore / questions.length);
      const percentageScore = roundScore((averageScore / 5) * 100);
      const weightedScore = roundScore((averageScore / 5) * definition.weight);

      return {
        key: definition.key,
        name: definition.name,
        weight: definition.weight,
        rawScore,
        averageScore,
        percentageScore,
        weightedScore,
        questions,
      };
    },
  );

  const overallScore = roundScore(
    categoryResults.reduce(
      (total, category) => total + category.weightedScore,
      0,
    ),
  );
  const interpretation = getScoreInterpretation(overallScore);
  const recommendation = generateRecommendationText(categoryResults);

  return {
    categoryResults,
    overallScore,
    interpretation,
    recommendation,
  };
}

export function generateRecommendationText(
  categoryResults: AssessmentCategoryResult[],
) {
  const weakestCategories = [...categoryResults]
    .sort((left, right) => left.percentageScore - right.percentageScore)
    .slice(0, 3);

  if (!weakestCategories.length) {
    return 'No recommendation available.';
  }

  const lead = `Primary improvement focus: ${weakestCategories
    .map((category) => category.name)
    .join(', ')}.`;

  const actions = weakestCategories
    .map((category) => recommendationMap[category.key])
    .join(' ');

  return `${lead} ${actions}`;
}
