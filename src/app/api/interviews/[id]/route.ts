import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { canManageInterviews } from '@/lib/permissions';
import { clearAllStatsCaches } from '@/lib/stats-cache';
import { objectIdSchema } from '@/lib/validations';
import Interview from '@/models/Interview';

/**
 * Returns one interview with full details including responses.
 */
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
        { error: 'Invalid interview ID.' },
        { status: 400 },
      );
    }

    await dbConnect();

    const interview = await Interview.findById(parsedId.data)
      .populate('orgId', 'name')
      .populate('conductedBy', 'name email role')
      .lean();

    if (!interview) {
      return NextResponse.json(
        { error: 'Interview not found.' },
        { status: 404 },
      );
    }

    const org =
      interview.orgId &&
      typeof interview.orgId === 'object' &&
      'name' in interview.orgId
        ? interview.orgId
        : null;

    const conductedBy =
      interview.conductedBy &&
      typeof interview.conductedBy === 'object' &&
      'name' in interview.conductedBy
        ? {
            id: interview.conductedBy._id.toString(),
            name: interview.conductedBy.name,
            email: interview.conductedBy.email,
            role: interview.conductedBy.role,
          }
        : null;

    return NextResponse.json({
      interview: {
        id: interview._id.toString(),
        orgId: org ? org._id.toString() : '',
        organizationName: org ? org.name : 'Unknown',
        intervieweeName: interview.intervieweeName,
        designation: interview.designation,
        department: interview.department,
        experience: interview.experience,
        responses: interview.responses.map(
          (r: { question: string; answer: string }) => ({
            question: r.question,
            answer: r.answer,
          }),
        ),
        fileUrl: interview.fileUrl,
        date: interview.date.toISOString(),
        conductedBy,
      },
    });
  } catch (error) {
    console.error('Interview GET by ID error:', error);

    return NextResponse.json(
      { error: 'Failed to fetch interview.' },
      { status: 500 },
    );
  }
}

/**
 * Deletes an interview record.
 */
export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user || !canManageInterviews(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    const { id } = await context.params;
    const parsedId = objectIdSchema.safeParse(id);

    if (!parsedId.success) {
      return NextResponse.json(
        { error: 'Invalid interview ID.' },
        { status: 400 },
      );
    }

    await dbConnect();

    const interview = await Interview.findByIdAndDelete(parsedId.data).lean();

    if (!interview) {
      return NextResponse.json(
        { error: 'Interview not found.' },
        { status: 404 },
      );
    }

    clearAllStatsCaches();

    return NextResponse.json({ message: 'Interview deleted successfully.' });
  } catch (error) {
    console.error('Interview DELETE error:', error);

    return NextResponse.json(
      { error: 'Failed to delete interview.' },
      { status: 500 },
    );
  }
}
