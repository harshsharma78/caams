import { NextResponse } from 'next/server';

import {
  calculateWeightedScores,
  getScoreInterpretation,
} from '@/lib/assessmentEngine';
import { auth } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { assessmentInputSchema, objectIdSchema } from '@/lib/validations';
import Assessment from '@/models/Assessment';
import Organization from '@/models/Organization';

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('orgId');
    const minScore = searchParams.get('minScore');
    const maxScore = searchParams.get('maxScore');

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

    if (minScore || maxScore) {
      query.overallScore = {};

      if (minScore) {
        (query.overallScore as Record<string, number>).$gte = Number(minScore);
      }

      if (maxScore) {
        (query.overallScore as Record<string, number>).$lte = Number(maxScore);
      }
    }

    await dbConnect();

    const assessments = await Assessment.find(query)
      .populate('orgId', 'name')
      .populate('assessorId', 'name email role')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      assessments: assessments.map((assessment) => {
        const interpretation = getScoreInterpretation(assessment.overallScore);

        return {
          id: assessment._id.toString(),
          organizationId: assessment.orgId._id.toString(),
          organizationName: assessment.orgId.name,
          overallScore: assessment.overallScore,
          status: assessment.status,
          statusLabel: interpretation.label,
          statusColor: interpretation.color,
          recommendation: assessment.recommendation,
          createdAt: assessment.createdAt.toISOString(),
          assessor:
            assessment.assessorId &&
            typeof assessment.assessorId === 'object' &&
            '_id' in assessment.assessorId
              ? {
                  id: assessment.assessorId._id.toString(),
                  name: assessment.assessorId.name,
                  email: assessment.assessorId.email,
                  role: assessment.assessorId.role,
                }
              : null,
        };
      }),
    });
  } catch (error) {
    console.error('Assessments GET error:', error);

    return NextResponse.json(
      { error: 'Failed to fetch assessments.' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = assessmentInputSchema.safeParse(body);

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

    const result = calculateWeightedScores(parsed.data.categories);

    const assessment = await Assessment.create({
      orgId: parsed.data.orgId,
      assessorId: session.user.id,
      categories: result.categoryResults,
      overallScore: result.overallScore,
      recommendation: result.recommendation,
      status: result.interpretation.status,
    });

    return NextResponse.json(
      {
        message: 'Assessment created successfully.',
        assessment: {
          id: assessment._id.toString(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Assessments POST error:', error);

    return NextResponse.json(
      { error: 'Failed to create assessment.' },
      { status: 500 },
    );
  }
}
