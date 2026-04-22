import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { canManageInterviews } from '@/lib/permissions';
import { clearAllStatsCaches } from '@/lib/stats-cache';
import { interviewSchema } from '@/lib/validations';
import Interview from '@/models/Interview';
import Organization from '@/models/Organization';

/**
 * Returns all interviews with optional filters: orgId, dateFrom, dateTo.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const orgId = searchParams.get('orgId');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};

    if (orgId) {
      filter.orgId = orgId;
    }

    if (dateFrom || dateTo) {
      filter.date = {};

      if (dateFrom) {
        filter.date.$gte = new Date(dateFrom);
      }

      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    const interviews = await Interview.find(filter)
      .populate('orgId', 'name')
      .populate('conductedBy', 'name email role')
      .sort({ date: -1 })
      .lean();

    return NextResponse.json({
      interviews: interviews.map((interview) => {
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

        return {
          id: interview._id.toString(),
          orgId: org ? org._id.toString() : '',
          organizationName: org ? org.name : 'Unknown',
          intervieweeName: interview.intervieweeName,
          designation: interview.designation,
          department: interview.department,
          experience: interview.experience,
          date: interview.date.toISOString(),
          conductedBy,
        };
      }),
    });
  } catch (error) {
    console.error('Interviews GET error:', error);

    return NextResponse.json(
      { error: 'Failed to fetch interviews.' },
      { status: 500 },
    );
  }
}

/**
 * Creates a new interview record for the signed-in admin.
 */
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user || !canManageInterviews(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = interviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid input.' },
        { status: 400 },
      );
    }

    await dbConnect();

    // Verify org exists
    const org = await Organization.findById(parsed.data.orgId).lean();

    if (!org) {
      return NextResponse.json(
        { error: 'Organization not found.' },
        { status: 404 },
      );
    }

    const interview = await Interview.create({
      ...parsed.data,
      conductedBy: session.user.id,
    });

    clearAllStatsCaches();

    return NextResponse.json(
      {
        message: 'Interview recorded successfully.',
        interview: {
          id: interview._id.toString(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Interviews POST error:', error);

    return NextResponse.json(
      { error: 'Failed to create interview.' },
      { status: 500 },
    );
  }
}
