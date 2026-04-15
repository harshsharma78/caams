import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { canManageOrganizations } from '@/lib/permissions';
import { organizationSchema } from '@/lib/validations';
import Assessment from '@/models/Assessment';
import Organization from '@/models/Organization';

/**
 * Returns all organizations with linked assessment counts.
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    await dbConnect();

    const organizations = await Organization.find({})
      .sort({ createdAt: -1 })
      .lean();

    const counts = await Assessment.aggregate<{ _id: string; count: number }>([
      {
        $group: {
          _id: '$orgId',
          count: { $sum: 1 },
        },
      },
    ]);

    const assessmentCountMap = new Map(
      counts.map((item) => [item._id.toString(), item.count]),
    );

    return NextResponse.json({
      organizations: organizations.map((organization) => ({
        id: organization._id.toString(),
        name: organization.name,
        industry: organization.industry,
        size: organization.size,
        sector: organization.sector,
        address: organization.address,
        contactPerson: organization.contactPerson,
        email: organization.email,
        phone: organization.phone,
        logoUrl: organization.logoUrl,
        createdAt: organization.createdAt.toISOString(),
        assessmentCount:
          assessmentCountMap.get(organization._id.toString()) ?? 0,
      })),
    });
  } catch (error) {
    console.error('Organizations GET error:', error);

    return NextResponse.json(
      { error: 'Failed to fetch organizations.' },
      { status: 500 },
    );
  }
}

/**
 * Creates a new organization for the signed-in admin.
 */
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user || !canManageOrganizations(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = organizationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid input.' },
        { status: 400 },
      );
    }

    await dbConnect();

    const organization = await Organization.create({
      ...parsed.data,
      email: parsed.data.email.toLowerCase(),
      createdBy: session.user.id,
    });

    return NextResponse.json(
      {
        message: 'Organization created successfully.',
        organization: {
          id: organization._id.toString(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Organizations POST error:', error);

    return NextResponse.json(
      { error: 'Failed to create organization.' },
      { status: 500 },
    );
  }
}
