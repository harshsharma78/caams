import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { canManageOrganizations } from '@/lib/permissions';
import { clearAllStatsCaches } from '@/lib/stats-cache';
import { objectIdSchema, organizationSchema } from '@/lib/validations';
import Assessment from '@/models/Assessment';
import CaseStudy from '@/models/CaseStudy';
import Interview from '@/models/Interview';
import Organization from '@/models/Organization';
import SecurityCheck from '@/models/SecurityCheck';

/**
 * Returns one organization with its assessment count.
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
        { error: 'Invalid organization ID.' },
        { status: 400 },
      );
    }

    await dbConnect();

    const [organization, assessmentCount] = await Promise.all([
      Organization.findById(parsedId.data)
        .populate('createdBy', 'name email role')
        .lean(),
      Assessment.countDocuments({ orgId: parsedId.data }),
    ]);

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found.' },
        { status: 404 },
      );
    }

    const createdBy =
      organization.createdBy &&
      typeof organization.createdBy === 'object' &&
      'name' in organization.createdBy
        ? {
            id: organization.createdBy._id.toString(),
            name: organization.createdBy.name,
            email: organization.createdBy.email,
            role: organization.createdBy.role,
          }
        : null;

    return NextResponse.json({
      organization: {
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
        assessmentCount,
        createdBy,
      },
    });
  } catch (error) {
    console.error('Organization GET by ID error:', error);

    return NextResponse.json(
      { error: 'Failed to fetch organization.' },
      { status: 500 },
    );
  }
}

/**
 * Updates an organization.
 */
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user || !canManageOrganizations(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    const { id } = await context.params;
    const parsedId = objectIdSchema.safeParse(id);

    if (!parsedId.success) {
      return NextResponse.json(
        { error: 'Invalid organization ID.' },
        { status: 400 },
      );
    }

    const body = await request.json();
    const parsedBody = organizationSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: parsedBody.error.issues[0]?.message ?? 'Invalid input.' },
        { status: 400 },
      );
    }

    await dbConnect();

    const organization = await Organization.findByIdAndUpdate(
      parsedId.data,
      {
        ...parsedBody.data,
        email: parsedBody.data.email.toLowerCase(),
      },
      {
        new: true,
        runValidators: true,
      },
    ).lean();

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found.' },
        { status: 404 },
      );
    }

    clearAllStatsCaches();

    return NextResponse.json({
      message: 'Organization updated successfully.',
      organization: {
        id: organization._id.toString(),
      },
    });
  } catch (error) {
    console.error('Organization PUT error:', error);

    return NextResponse.json(
      { error: 'Failed to update organization.' },
      { status: 500 },
    );
  }
}

/**
 * Deletes an organization.
 */
export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user || !canManageOrganizations(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    const { id } = await context.params;
    const parsedId = objectIdSchema.safeParse(id);

    if (!parsedId.success) {
      return NextResponse.json(
        { error: 'Invalid organization ID.' },
        { status: 400 },
      );
    }

    await dbConnect();

    const organization = await Organization.findByIdAndDelete(
      parsedId.data,
    ).lean();

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found.' },
        { status: 404 },
      );
    }

    // Cascade delete all related records
    await Promise.all([
      Assessment.deleteMany({ orgId: parsedId.data }),
      SecurityCheck.deleteMany({ orgId: parsedId.data }),
      Interview.deleteMany({ orgId: parsedId.data }),
      CaseStudy.deleteMany({ orgId: parsedId.data }),
    ]);

    clearAllStatsCaches();

    return NextResponse.json({ message: 'Organization deleted successfully.' });
  } catch (error) {
    console.error('Organization DELETE error:', error);

    return NextResponse.json(
      { error: 'Failed to delete organization.' },
      { status: 500 },
    );
  }
}
