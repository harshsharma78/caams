import {
  getSecurityRiskLevel,
  calculateSecurityScore,
  buildDefaultSecurityChecklist,
  getSecurityCategoryBreakdown,
  generateSecurityRecommendations,
  generateSecurityFindings,
  generateSecurityActionItems,
  SECURITY_STATUS_POINTS,
  SECURITY_CHECKLIST_TEMPLATES,
} from '@/lib/securityEngine';
import type { SecurityChecklistItem } from '@/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a 30-item checklist with a uniform status. */
function buildUniformChecklist(
  status: SecurityChecklistItem['status'],
): SecurityChecklistItem[] {
  return SECURITY_CHECKLIST_TEMPLATES.flatMap((cat) =>
    cat.items.map((entry) => ({
      category: cat.category,
      item: entry.item,
      status,
      notes: '',
    })),
  );
}

/** Build a checklist that produces a target score by mixing statuses. */
function buildChecklistForScore(targetScore: number): SecurityChecklistItem[] {
  const items = buildUniformChecklist('non-compliant'); // score = 0
  // Each compliant adds 2 points; set items to compliant until we reach target
  let remaining = targetScore;
  for (const item of items) {
    if (remaining <= 0) break;
    if (remaining >= 2) {
      item.status = 'compliant';
      remaining -= 2;
    } else {
      item.status = 'partial';
      remaining -= 1;
    }
  }
  return items;
}

// ---------------------------------------------------------------------------
// getSecurityRiskLevel — Boundary value tests
// ---------------------------------------------------------------------------

describe('getSecurityRiskLevel', () => {
  it('should return Low Risk for score = 50 (boundary)', () => {
    const result = getSecurityRiskLevel(50);
    expect(result.level).toBe('low');
    expect(result.label).toBe('Low Risk');
  });

  it('should return Low Risk for score = 60 (max)', () => {
    expect(getSecurityRiskLevel(60).level).toBe('low');
  });

  it('should return Medium Risk for score = 49', () => {
    expect(getSecurityRiskLevel(49).level).toBe('medium');
  });

  it('should return Medium Risk for score = 35 (boundary)', () => {
    const result = getSecurityRiskLevel(35);
    expect(result.level).toBe('medium');
    expect(result.label).toBe('Medium Risk');
  });

  it('should return High Risk for score = 34', () => {
    const result = getSecurityRiskLevel(34);
    expect(result.level).toBe('high');
    expect(result.label).toBe('High Risk');
  });

  it('should return High Risk for score = 20 (boundary)', () => {
    expect(getSecurityRiskLevel(20).level).toBe('high');
  });

  it('should return Critical Risk for score = 19', () => {
    const result = getSecurityRiskLevel(19);
    expect(result.level).toBe('critical');
    expect(result.label).toBe('Critical Risk');
  });

  it('should return Critical Risk for score = 0', () => {
    expect(getSecurityRiskLevel(0).level).toBe('critical');
  });
});

// ---------------------------------------------------------------------------
// SECURITY_STATUS_POINTS
// ---------------------------------------------------------------------------

describe('SECURITY_STATUS_POINTS', () => {
  it('should assign 2 points for compliant', () => {
    expect(SECURITY_STATUS_POINTS.compliant).toBe(2);
  });

  it('should assign 1 point for partial', () => {
    expect(SECURITY_STATUS_POINTS.partial).toBe(1);
  });

  it('should assign 0 points for non-compliant', () => {
    expect(SECURITY_STATUS_POINTS['non-compliant']).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// calculateSecurityScore
// ---------------------------------------------------------------------------

describe('calculateSecurityScore', () => {
  it('should return 60 for all compliant (30 items × 2 pts)', () => {
    const checklist = buildUniformChecklist('compliant');
    expect(calculateSecurityScore(checklist)).toBe(60);
  });

  it('should return 30 for all partial (30 items × 1 pt)', () => {
    const checklist = buildUniformChecklist('partial');
    expect(calculateSecurityScore(checklist)).toBe(30);
  });

  it('should return 0 for all non-compliant', () => {
    const checklist = buildUniformChecklist('non-compliant');
    expect(calculateSecurityScore(checklist)).toBe(0);
  });

  it('should correctly sum mixed statuses', () => {
    const checklist = buildChecklistForScore(42);
    expect(calculateSecurityScore(checklist)).toBe(42);
  });
});

// ---------------------------------------------------------------------------
// buildDefaultSecurityChecklist
// ---------------------------------------------------------------------------

describe('buildDefaultSecurityChecklist', () => {
  it('should return exactly 30 checklist items', () => {
    expect(buildDefaultSecurityChecklist()).toHaveLength(30);
  });

  it('should default all items to partial status', () => {
    const checklist = buildDefaultSecurityChecklist();
    checklist.forEach((item) => {
      expect(item.status).toBe('partial');
    });
  });

  it('should cover all 5 security categories', () => {
    const checklist = buildDefaultSecurityChecklist();
    const categories = new Set(checklist.map((item) => item.category));
    expect(categories.size).toBe(5);
  });
});

// ---------------------------------------------------------------------------
// getSecurityCategoryBreakdown
// ---------------------------------------------------------------------------

describe('getSecurityCategoryBreakdown', () => {
  it('should return 5 category breakdowns', () => {
    const checklist = buildUniformChecklist('compliant');
    const breakdown = getSecurityCategoryBreakdown(checklist);
    expect(breakdown).toHaveLength(5);
  });

  it('should have maxScore of 12 per category (6 items × 2 pts)', () => {
    const checklist = buildUniformChecklist('compliant');
    const breakdown = getSecurityCategoryBreakdown(checklist);
    breakdown.forEach((cat) => {
      expect(cat.maxScore).toBe(12);
    });
  });

  it('should have all compliant counts = 6 for fully compliant checklist', () => {
    const checklist = buildUniformChecklist('compliant');
    const breakdown = getSecurityCategoryBreakdown(checklist);
    breakdown.forEach((cat) => {
      expect(cat.compliantCount).toBe(6);
      expect(cat.partialCount).toBe(0);
      expect(cat.nonCompliantCount).toBe(0);
    });
  });

  it('should sum category scores to match total score', () => {
    const checklist = buildChecklistForScore(42);
    const breakdown = getSecurityCategoryBreakdown(checklist);
    const totalFromBreakdown = breakdown.reduce(
      (sum, cat) => sum + cat.score,
      0,
    );
    expect(totalFromBreakdown).toBe(calculateSecurityScore(checklist));
  });
});

// ---------------------------------------------------------------------------
// generateSecurityRecommendations
// ---------------------------------------------------------------------------

describe('generateSecurityRecommendations', () => {
  it('should return empty array for fully compliant checklist', () => {
    const checklist = buildUniformChecklist('compliant');
    expect(generateSecurityRecommendations(checklist)).toHaveLength(0);
  });

  it('should include recommendations for non-compliant items', () => {
    const checklist = buildUniformChecklist('non-compliant');
    const recommendations = generateSecurityRecommendations(checklist);
    expect(recommendations.length).toBeGreaterThan(0);
  });

  it('should deduplicate recommendations', () => {
    const checklist = buildUniformChecklist('partial');
    const recommendations = generateSecurityRecommendations(checklist);
    const unique = new Set(recommendations);
    expect(recommendations.length).toBe(unique.size);
  });
});

// ---------------------------------------------------------------------------
// generateSecurityFindings
// ---------------------------------------------------------------------------

describe('generateSecurityFindings', () => {
  it('should return empty for fully compliant', () => {
    expect(
      generateSecurityFindings(buildUniformChecklist('compliant')),
    ).toHaveLength(0);
  });

  it('should label non-compliant items as "Critical gap"', () => {
    const checklist = buildUniformChecklist('non-compliant');
    const findings = generateSecurityFindings(checklist);
    findings.forEach((f) => expect(f).toContain('Critical gap'));
  });

  it('should include notes when present', () => {
    const checklist = buildUniformChecklist('partial');
    checklist[0].notes = 'Needs review';
    const findings = generateSecurityFindings(checklist);
    expect(findings[0]).toContain('Needs review');
  });
});

// ---------------------------------------------------------------------------
// generateSecurityActionItems
// ---------------------------------------------------------------------------

describe('generateSecurityActionItems', () => {
  it('should return only non-compliant action items', () => {
    const checklist = buildUniformChecklist('partial');
    expect(generateSecurityActionItems(checklist)).toHaveLength(0);
  });

  it('should return 30 action items for all non-compliant', () => {
    const checklist = buildUniformChecklist('non-compliant');
    expect(generateSecurityActionItems(checklist)).toHaveLength(30);
  });
});

// ---------------------------------------------------------------------------
// SECURITY_CHECKLIST_TEMPLATES integrity
// ---------------------------------------------------------------------------

describe('SECURITY_CHECKLIST_TEMPLATES', () => {
  it('should define 5 categories with 6 items each', () => {
    expect(SECURITY_CHECKLIST_TEMPLATES).toHaveLength(5);
    SECURITY_CHECKLIST_TEMPLATES.forEach((cat) => {
      expect(cat.items).toHaveLength(6);
    });
  });

  it('should have a recommendation for every item', () => {
    SECURITY_CHECKLIST_TEMPLATES.forEach((cat) => {
      cat.items.forEach((item) => {
        expect(item.recommendation).toBeTruthy();
        expect(item.recommendation.length).toBeGreaterThan(10);
      });
    });
  });
});
