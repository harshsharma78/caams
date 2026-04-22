import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { clearAllStatsCaches } from '@/lib/stats-cache';
import { canManageOrganizations } from '@/lib/permissions';
import {
  calculateSecurityScore,
  generateSecurityFindings,
  generateSecurityRecommendations,
  getSecurityRiskLevel,
} from '@/lib/securityEngine';
import { objectIdSchema, securityAssessmentSchema } from '@/lib/validations';
import Organization from '@/models/Organization';
import SecurityCheck from '@/models/SecurityCheck';

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get('page') ?? '1'));
    const limit = Math.min(
      50,
      Math.max(1, Number(searchParams.get('limit') ?? '12')),
    );
    const orgId = searchParams.get('orgId');
    const risk = searchParams.get('risk')?.trim();

    const query: Record<string, unknown> = {};

    if (orgId) {
      const parsedOrgId = objectIdSchema.safeParse(orgId);

      if (!parsedOrgId.success) {
        return NextResponse.json(
          { error: 'Invalid organization ID.' },
          { status: 400 },
        );
      }

      query.orgId = parsedOrgId.data;
    }

    if (risk) {
      query.overallRisk = risk;
    }

    await dbConnect();

    const [securityChecks, total] = await Promise.all([
      SecurityCheck.find(query)
        .populate('orgId', 'name')
        .populate('conductedBy', 'name email role')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      SecurityCheck.countDocuments(query),
    ]);

    return NextResponse.json({
      securityAssessments: securityChecks
        .filter(
          (securityCheck) =>
            securityCheck.orgId &&
            typeof securityCheck.orgId === 'object' &&
            'name' in securityCheck.orgId,
        )
        .map((securityCheck) => ({
          id: securityCheck._id.toString(),
          orgId: securityCheck.orgId._id.toString(),
          organizationName: securityCheck.orgId.name,
          score: securityCheck.score,
          overallRisk: securityCheck.overallRisk,
          findings: securityCheck.findings,
          recommendations: securityCheck.recommendations,
          createdAt: securityCheck.createdAt.toISOString(),
          conductedBy:
            securityCheck.conductedBy &&
            typeof securityCheck.conductedBy === 'object' &&
            '_id' in securityCheck.conductedBy
              ? {
                  id: securityCheck.conductedBy._id.toString(),
                  name: securityCheck.conductedBy.name,
                  email: securityCheck.conductedBy.email,
                  role: securityCheck.conductedBy.role,
                }
              : null,
        })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error) {
    console.error('Security assessments GET error:', error);

    return NextResponse.json(
      { error: 'Failed to fetch security assessments.' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user || !canManageOrganizations(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = securityAssessmentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid input.' },
        { status: 400 },
      );
    }

    await dbConnect();

    const organization = await Organization.findById(parsed.data.orgId).lean();

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found.' },
        { status: 404 },
      );
    }

    const score = calculateSecurityScore(parsed.data.checklist);
    const overallRisk = getSecurityRiskLevel(score).level;
    const findings = generateSecurityFindings(parsed.data.checklist);
    const recommendations = generateSecurityRecommendations(parsed.data.checklist);

    const securityCheck = await SecurityCheck.create({
      orgId: parsed.data.orgId,
      checklist: parsed.data.checklist,
      overallRisk,
      score,
      findings,
      recommendations,
      conductedBy: session.user.id,
    });

    clearAllStatsCaches();

    return NextResponse.json(
      {
        message: 'Security assessment created successfully.',
        securityAssessment: { id: securityCheck._id.toString() },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Security assessments POST error:', error);

    return NextResponse.json(
      { error: 'Failed to create security assessment.' },
      { status: 500 },
    );
  }
}
