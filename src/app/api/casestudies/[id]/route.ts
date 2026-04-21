import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { canManageOrganizations } from '@/lib/permissions';
import { caseStudySchema, objectIdSchema } from '@/lib/validations';
import CaseStudy from '@/models/CaseStudy';

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
        { error: 'Invalid case study ID.' },
        { status: 400 },
      );
    }

    await dbConnect();

    const caseStudy = await CaseStudy.findById(parsedId.data)
      .populate('uploadedBy', 'name email role')
      .lean();

    if (!caseStudy) {
      return NextResponse.json(
        { error: 'Case study not found.' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      caseStudy: {
        id: caseStudy._id.toString(),
        title: caseStudy.title,
        organization: caseStudy.organization,
        sector: caseStudy.sector,
        challenge: caseStudy.challenge,
        solution: caseStudy.solution,
        outcome: caseStudy.outcome,
        results: caseStudy.results,
        tags: caseStudy.tags,
        fileUrl: caseStudy.fileUrl,
        createdAt: caseStudy.createdAt.toISOString(),
        uploadedBy:
          caseStudy.uploadedBy &&
          typeof caseStudy.uploadedBy === 'object' &&
          '_id' in caseStudy.uploadedBy
            ? {
                id: caseStudy.uploadedBy._id.toString(),
                name: caseStudy.uploadedBy.name,
                email: caseStudy.uploadedBy.email,
                role: caseStudy.uploadedBy.role,
              }
            : null,
      },
    });
  } catch (error) {
    console.error('Case study GET by ID error:', error);

    return NextResponse.json(
      { error: 'Failed to fetch case study.' },
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
        { error: 'Invalid case study ID.' },
        { status: 400 },
      );
    }

    const body = await request.json();
    const parsed = caseStudySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid input.' },
        { status: 400 },
      );
    }

    await dbConnect();

    const caseStudy = await CaseStudy.findByIdAndUpdate(parsedId.data, parsed.data, {
      new: true,
      runValidators: true,
    }).lean();

    if (!caseStudy) {
      return NextResponse.json(
        { error: 'Case study not found.' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      message: 'Case study updated successfully.',
      caseStudy: { id: caseStudy._id.toString() },
    });
  } catch (error) {
    console.error('Case study PUT error:', error);

    return NextResponse.json(
      { error: 'Failed to update case study.' },
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
        { error: 'Invalid case study ID.' },
        { status: 400 },
      );
    }

    await dbConnect();

    const caseStudy = await CaseStudy.findByIdAndDelete(parsedId.data).lean();

    if (!caseStudy) {
      return NextResponse.json(
        { error: 'Case study not found.' },
        { status: 404 },
      );
    }

    return NextResponse.json({ message: 'Case study deleted successfully.' });
  } catch (error) {
    console.error('Case study DELETE error:', error);

    return NextResponse.json(
      { error: 'Failed to delete case study.' },
      { status: 500 },
    );
  }
}
