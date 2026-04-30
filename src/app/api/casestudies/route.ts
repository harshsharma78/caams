import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { canManageOrganizations } from '@/lib/permissions';
import { clearAllStatsCaches } from '@/lib/stats-cache';
import { caseStudySchema } from '@/lib/validations';
import CaseStudy from '@/models/CaseStudy';
import Organization from '@/models/Organization';

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
    const search = searchParams.get('search')?.trim() ?? '';
    const sector = searchParams.get('sector')?.trim() ?? '';

    const query: Record<string, unknown> = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
      ];
    }

    if (sector) {
      query.sector = sector;
    }

    await dbConnect();

    const [caseStudies, total] = await Promise.all([
      CaseStudy.find(query)
        .populate('orgId', 'name')
        .populate('uploadedBy', 'name email role')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      CaseStudy.countDocuments(query),
    ]);

    return NextResponse.json({
      caseStudies: caseStudies.map((caseStudy) => {
        const hasOrg =
          caseStudy.orgId &&
          typeof caseStudy.orgId === 'object' &&
          'name' in caseStudy.orgId;

        return {
          id: caseStudy._id.toString(),
          title: caseStudy.title,
          orgId: hasOrg
            ? caseStudy.orgId._id.toString()
            : caseStudy.orgId?.toString() ?? '',
          organizationName: hasOrg
            ? caseStudy.orgId.name
            : 'Deleted Organization',
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
        };
      }),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error) {
    console.error('Case studies GET error:', error);

    return NextResponse.json(
      { error: 'Failed to fetch case studies.' },
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
    const parsed = caseStudySchema.safeParse(body);

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

    const caseStudy = await CaseStudy.create({
      ...parsed.data,
      uploadedBy: session.user.id,
    });

    clearAllStatsCaches();

    return NextResponse.json(
      {
        message: 'Case study created successfully.',
        caseStudy: { id: caseStudy._id.toString() },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Case studies POST error:', error);

    return NextResponse.json(
      { error: 'Failed to create case study.' },
      { status: 500 },
    );
  }
}
