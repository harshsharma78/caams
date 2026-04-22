import { NextResponse } from 'next/server';

import {
  calculateWeightedScores,
  getScoreInterpretation,
} from '@/lib/assessmentEngine';
import { auth } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { clearAllStatsCaches } from '@/lib/stats-cache';
import { assessmentInputSchema, objectIdSchema } from '@/lib/validations';
import Assessment from '@/models/Assessment';
import Organization from '@/models/Organization';

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { id } = await context.params;
    const parsedId = objectIdSchema.safeParse(id);

    if (!parsedId.success) {
      return NextResponse.json(
        { error: 'Invalid assessment ID.' },
        { status: 400 },
      );
    }

    await dbConnect();

    const assessment = await Assessment.findById(parsedId.data)
      .populate('orgId', 'name')
      .populate('assessorId', 'name email role')
      .lean();

    if (!assessment) {
      return NextResponse.json(
        { error: 'Assessment not found.' },
        { status: 404 },
      );
    }

    const interpretation = getScoreInterpretation(assessment.overallScore);

    return NextResponse.json({
      assessment: {
        id: assessment._id.toString(),
        organizationId: assessment.orgId._id.toString(),
        organizationName: assessment.orgId.name,
        overallScore: assessment.overallScore,
        status: assessment.status,
        statusLabel: interpretation.label,
        statusColor: interpretation.color,
        recommendation: assessment.recommendation,
        createdAt: assessment.createdAt.toISOString(),
        categories: assessment.categories,
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
      },
    });
  } catch (error) {
    console.error('Assessment GET by ID error:', error);

    return NextResponse.json(
      { error: 'Failed to fetch assessment.' },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { id } = await context.params;
    const parsedId = objectIdSchema.safeParse(id);

    if (!parsedId.success) {
      return NextResponse.json(
        { error: 'Invalid assessment ID.' },
        { status: 400 },
      );
    }

    const body = await request.json();
    const parsedBody = assessmentInputSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: parsedBody.error.issues[0]?.message ?? 'Invalid input.' },
        { status: 400 },
      );
    }

    await dbConnect();

    const organization = await Organization.findById(
      parsedBody.data.orgId,
    ).lean();

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found.' },
        { status: 404 },
      );
    }

    const result = calculateWeightedScores(parsedBody.data.categories);

    const assessment = await Assessment.findByIdAndUpdate(
      parsedId.data,
      {
        orgId: parsedBody.data.orgId,
        assessorId: session.user.id,
        categories: result.categoryResults,
        overallScore: result.overallScore,
        recommendation: result.recommendation,
        status: result.interpretation.status,
      },
      {
        new: true,
        runValidators: true,
      },
    ).lean();

    if (!assessment) {
      return NextResponse.json(
        { error: 'Assessment not found.' },
        { status: 404 },
      );
    }

    clearAllStatsCaches();

    return NextResponse.json({
      message: 'Assessment updated successfully.',
      assessment: {
        id: assessment._id.toString(),
      },
    });
  } catch (error) {
    console.error('Assessment PUT error:', error);

    return NextResponse.json(
      { error: 'Failed to update assessment.' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { id } = await context.params;
    const parsedId = objectIdSchema.safeParse(id);

    if (!parsedId.success) {
      return NextResponse.json(
        { error: 'Invalid assessment ID.' },
        { status: 400 },
      );
    }

    await dbConnect();

    const assessment = await Assessment.findByIdAndDelete(parsedId.data).lean();

    if (!assessment) {
      return NextResponse.json(
        { error: 'Assessment not found.' },
        { status: 404 },
      );
    }

    clearAllStatsCaches();

    return NextResponse.json({ message: 'Assessment deleted successfully.' });
  } catch (error) {
    console.error('Assessment DELETE error:', error);

    return NextResponse.json(
      { error: 'Failed to delete assessment.' },
      { status: 500 },
    );
  }
}
