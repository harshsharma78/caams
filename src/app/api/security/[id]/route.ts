import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import {
  calculateSecurityScore,
  generateSecurityActionItems,
  generateSecurityFindings,
  generateSecurityRecommendations,
  getSecurityCategoryBreakdown,
  getSecurityRiskLevel,
} from '@/lib/securityEngine';
import { canManageOrganizations } from '@/lib/permissions';
import { objectIdSchema, securityAssessmentSchema } from '@/lib/validations';
import Organization from '@/models/Organization';
import SecurityCheck from '@/models/SecurityCheck';
import type { SecurityChecklistItem } from '@/types';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { id } = await params;
    const parsedId = objectIdSchema.safeParse(id);

    if (!parsedId.success) {
      return NextResponse.json(
        { error: 'Invalid security assessment ID.' },
        { status: 400 },
      );
    }

    await dbConnect();

    const securityCheck = await SecurityCheck.findById(parsedId.data)
      .populate('orgId', 'name')
      .populate('conductedBy', 'name email role')
      .lean();

    if (
      !securityCheck ||
      !securityCheck.orgId ||
      typeof securityCheck.orgId !== 'object' ||
      !('name' in securityCheck.orgId)
    ) {
      return NextResponse.json(
        { error: 'Security assessment not found.' },
        { status: 404 },
      );
    }

    const checklist: SecurityChecklistItem[] = securityCheck.checklist.map(
      (item: {
        category: string;
        item: string;
        status: SecurityChecklistItem['status'];
        notes: string;
      }) => ({
        category: item.category,
        item: item.item,
        status: item.status,
        notes: item.notes,
      }),
    );

    return NextResponse.json({
      securityAssessment: {
        id: securityCheck._id.toString(),
        orgId: securityCheck.orgId._id.toString(),
        organizationName: securityCheck.orgId.name,
        score: securityCheck.score,
        overallRisk: securityCheck.overallRisk,
        checklist,
        findings: securityCheck.findings,
        recommendations: securityCheck.recommendations,
        categoryBreakdown: getSecurityCategoryBreakdown(checklist),
        actionItems: generateSecurityActionItems(checklist),
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
      },
    });
  } catch (error) {
    console.error('Security assessment GET by ID error:', error);

    return NextResponse.json(
      { error: 'Failed to fetch security assessment.' },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user || !canManageOrganizations(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    const { id } = await params;
    const parsedId = objectIdSchema.safeParse(id);

    if (!parsedId.success) {
      return NextResponse.json(
        { error: 'Invalid security assessment ID.' },
        { status: 400 },
      );
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

    const securityCheck = await SecurityCheck.findByIdAndUpdate(
      parsedId.data,
      {
        orgId: parsed.data.orgId,
        checklist: parsed.data.checklist,
        overallRisk,
        score,
        findings,
        recommendations,
      },
      { new: true, runValidators: true },
    ).lean();

    if (!securityCheck) {
      return NextResponse.json(
        { error: 'Security assessment not found.' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      message: 'Security assessment updated successfully.',
      securityAssessment: { id: securityCheck._id.toString() },
    });
  } catch (error) {
    console.error('Security assessment PUT error:', error);

    return NextResponse.json(
      { error: 'Failed to update security assessment.' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user || !canManageOrganizations(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    const { id } = await params;
    const parsedId = objectIdSchema.safeParse(id);

    if (!parsedId.success) {
      return NextResponse.json(
        { error: 'Invalid security assessment ID.' },
        { status: 400 },
      );
    }

    await dbConnect();

    const securityCheck = await SecurityCheck.findByIdAndDelete(
      parsedId.data,
    ).lean();

    if (!securityCheck) {
      return NextResponse.json(
        { error: 'Security assessment not found.' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      message: 'Security assessment deleted successfully.',
    });
  } catch (error) {
    console.error('Security assessment DELETE error:', error);

    return NextResponse.json(
      { error: 'Failed to delete security assessment.' },
      { status: 500 },
    );
  }
}
