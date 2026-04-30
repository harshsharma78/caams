import {
  calculateWeightedScores,
  getScoreInterpretation,
  generateRecommendationText,
  ASSESSMENT_CATEGORIES,
  type AssessmentCategoryInput,
  type AssessmentCategoryResult,
} from '@/lib/assessmentEngine';
import { assessmentQuestionIdsByCategory, assessmentCategoryKeys } from '@/lib/validations';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a full 6-category input where every question has the same score. */
function buildUniformInput(score: number): AssessmentCategoryInput[] {
  return assessmentCategoryKeys.map((key) => ({
    key,
    questions: assessmentQuestionIdsByCategory[key].map((id) => ({
      id,
      score,
    })),
  }));
}

/** Build input with a specific per-category average score map. */
function buildCustomInput(
  scoreMap: Record<string, number>,
): AssessmentCategoryInput[] {
  return assessmentCategoryKeys.map((key) => ({
    key,
    questions: assessmentQuestionIdsByCategory[key].map((id) => ({
      id,
      score: scoreMap[key] ?? 3,
    })),
  }));
}

// ---------------------------------------------------------------------------
// getScoreInterpretation
// ---------------------------------------------------------------------------

describe('getScoreInterpretation', () => {
  it('should return "Not Ready" for score <= 40', () => {
    expect(getScoreInterpretation(0).status).toBe('not-ready');
    expect(getScoreInterpretation(20).status).toBe('not-ready');
    expect(getScoreInterpretation(40).status).toBe('not-ready');
  });

  it('should return "Partially Ready" for score 41–60', () => {
    expect(getScoreInterpretation(41).status).toBe('partially-ready');
    expect(getScoreInterpretation(50).status).toBe('partially-ready');
    expect(getScoreInterpretation(60).status).toBe('partially-ready');
  });

  it('should return "Mostly Ready" for score 61–80', () => {
    expect(getScoreInterpretation(61).status).toBe('mostly-ready');
    expect(getScoreInterpretation(70).status).toBe('mostly-ready');
    expect(getScoreInterpretation(80).status).toBe('mostly-ready');
  });

  it('should return "Cloud Ready" for score > 80', () => {
    expect(getScoreInterpretation(81).status).toBe('cloud-ready');
    expect(getScoreInterpretation(85).label).toBe('Cloud Ready');
    expect(getScoreInterpretation(100).status).toBe('cloud-ready');
  });

  it('should classify score 85 as Cloud Ready', () => {
    const result = getScoreInterpretation(85);
    expect(result.label).toBe('Cloud Ready');
    expect(result.status).toBe('cloud-ready');
    expect(result.color).toBe('bg-emerald-500');
  });
});

// ---------------------------------------------------------------------------
// calculateWeightedScores
// ---------------------------------------------------------------------------

describe('calculateWeightedScores', () => {
  it('should return 100 for all max answers (score = 5)', () => {
    const input = buildUniformInput(5);
    const result = calculateWeightedScores(input);
    expect(result.overallScore).toBe(100);
    expect(result.interpretation.status).toBe('cloud-ready');
  });

  it('should return 20 for all min answers (score = 1)', () => {
    const input = buildUniformInput(1);
    const result = calculateWeightedScores(input);
    expect(result.overallScore).toBe(20);
    expect(result.interpretation.status).toBe('not-ready');
  });

  it('should return 60 for all mid answers (score = 3)', () => {
    const input = buildUniformInput(3);
    const result = calculateWeightedScores(input);
    expect(result.overallScore).toBe(60);
    expect(result.interpretation.status).toBe('partially-ready');
  });

  it('should calculate correct weighted scores for mixed input', () => {
    // infra=5 (weight 20), security=4 (weight 20), app=3 (weight 15),
    // data=2 (weight 15), team=1 (weight 15), cost=5 (weight 15)
    const scoreMap: Record<string, number> = {
      'infrastructure-readiness': 5,
      'security-compliance': 4,
      'application-portability': 3,
      'data-management': 2,
      'team-skills-readiness': 1,
      'cost-roi-analysis': 5,
    };
    const input = buildCustomInput(scoreMap);
    const result = calculateWeightedScores(input);

    // Manually verify:
    // infra: avg=5, weighted=(5/5)*20=20
    // security: avg=4, weighted=(4/5)*20=16
    // app: avg=3, weighted=(3/5)*15=9
    // data: avg=2, weighted=(2/5)*15=6
    // team: avg=1, weighted=(1/5)*15=3
    // cost: avg=5, weighted=(5/5)*15=15
    // total = 20+16+9+6+3+15 = 69
    expect(result.overallScore).toBe(69);
    expect(result.interpretation.status).toBe('mostly-ready');
  });

  it('should produce correct per-category breakdown', () => {
    const input = buildUniformInput(4);
    const result = calculateWeightedScores(input);

    expect(result.categoryResults).toHaveLength(6);

    const infraCategory = result.categoryResults.find(
      (c) => c.key === 'infrastructure-readiness',
    )!;
    expect(infraCategory.weight).toBe(20);
    expect(infraCategory.averageScore).toBe(4);
    expect(infraCategory.percentageScore).toBe(80);
    expect(infraCategory.weightedScore).toBe(16);
    expect(infraCategory.rawScore).toBe(20); // 4*5

    const appCategory = result.categoryResults.find(
      (c) => c.key === 'application-portability',
    )!;
    expect(appCategory.weight).toBe(15);
    expect(appCategory.weightedScore).toBe(12);
  });

  it('should throw when a category is missing', () => {
    const input = buildUniformInput(3).slice(0, 5); // only 5 categories
    expect(() => calculateWeightedScores(input)).toThrow(
      /Missing assessment category/,
    );
  });

  it('should throw when a question is missing within a category', () => {
    const input = buildUniformInput(3);
    // Remove one question from the first category
    input[0].questions = input[0].questions.slice(0, 4);
    expect(() => calculateWeightedScores(input)).toThrow(
      /Missing score for question/,
    );
  });

  it('should verify all 30 question IDs map correctly across the scoring matrix', () => {
    const input = buildUniformInput(3);
    const result = calculateWeightedScores(input);

    const allQuestionIds = result.categoryResults.flatMap((cat) =>
      cat.questions.map((q) => q.id),
    );

    expect(allQuestionIds).toHaveLength(30);

    // Every expected question ID from validations should appear exactly once
    const expectedIds = assessmentCategoryKeys.flatMap(
      (key) => assessmentQuestionIdsByCategory[key],
    );
    expect(allQuestionIds.sort()).toEqual(expectedIds.sort());
  });

  it('should include a recommendation referencing the weakest categories', () => {
    const scoreMap: Record<string, number> = {
      'infrastructure-readiness': 5,
      'security-compliance': 5,
      'application-portability': 1,
      'data-management': 1,
      'team-skills-readiness': 1,
      'cost-roi-analysis': 5,
    };
    const input = buildCustomInput(scoreMap);
    const result = calculateWeightedScores(input);

    expect(result.recommendation).toContain('Application Portability');
    expect(result.recommendation).toContain('Data Management');
    expect(result.recommendation).toContain('Team & Skills Readiness');
  });
});

// ---------------------------------------------------------------------------
// generateRecommendationText
// ---------------------------------------------------------------------------

describe('generateRecommendationText', () => {
  it('should reference the 3 weakest categories in order', () => {
    const categories: AssessmentCategoryResult[] =
      ASSESSMENT_CATEGORIES.map((def) => ({
        key: def.key,
        name: def.name,
        weight: def.weight,
        rawScore: 15,
        averageScore: 3,
        percentageScore: def.key === 'data-management' ? 20 : 80,
        weightedScore: 0,
        questions: [],
      }));

    const text = generateRecommendationText(categories);
    expect(text).toContain('Data Management');
    expect(text).toContain('Primary improvement focus');
  });

  it('should return fallback for empty array', () => {
    expect(generateRecommendationText([])).toBe('No recommendation available.');
  });
});

// ---------------------------------------------------------------------------
// ASSESSMENT_CATEGORIES constant integrity
// ---------------------------------------------------------------------------

describe('ASSESSMENT_CATEGORIES', () => {
  it('should define exactly 6 categories', () => {
    expect(ASSESSMENT_CATEGORIES).toHaveLength(6);
  });

  it('should have weights summing to 100', () => {
    const totalWeight = ASSESSMENT_CATEGORIES.reduce(
      (sum, cat) => sum + cat.weight,
      0,
    );
    expect(totalWeight).toBe(100);
  });

  it('should have 5 questions per category (30 total)', () => {
    ASSESSMENT_CATEGORIES.forEach((cat) => {
      expect(cat.questions).toHaveLength(5);
    });
  });
});
