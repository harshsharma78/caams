import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { isAdmin } from '@/lib/permissions';
import { clearAllStatsCaches } from '@/lib/stats-cache';
import { objectIdSchema } from '@/lib/validations';
import User from '@/models/User';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user || !isAdmin(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    const { id } = await params;
    const parsedId = objectIdSchema.safeParse(id);

    if (!parsedId.success) {
      return NextResponse.json({ error: 'Invalid user ID.' }, { status: 400 });
    }

    const body = await request.json();
    const role = body?.role;
    const status = body?.status;

    const allowedRoles = ['admin', 'analyst', 'viewer', 'org_manager'];
    const allowedStatuses = ['active', 'pending', 'suspended'];

    if (
      typeof role !== 'undefined' &&
      !allowedRoles.includes(role)
    ) {
      return NextResponse.json(
        { error: 'Invalid role.' },
        { status: 400 },
      );
    }

    if (
      typeof status !== 'undefined' &&
      !allowedStatuses.includes(status)
    ) {
      return NextResponse.json(
        { error: 'Invalid status.' },
        { status: 400 },
      );
    }

    // Prevent self-demotion
    if (
      parsedId.data === session.user.id &&
      ((typeof role !== 'undefined' && role !== 'admin') ||
        status === 'suspended')
    ) {
      return NextResponse.json(
        { error: 'You cannot change your own admin access.' },
        { status: 400 },
      );
    }

    if (typeof role === 'undefined' && typeof status === 'undefined') {
      return NextResponse.json(
        { error: 'Provide a role or status update.' },
        { status: 400 },
      );
    }

    await dbConnect();

    const user = await User.findByIdAndUpdate(
      parsedId.data,
      {
        ...(typeof role !== 'undefined' ? { role } : {}),
        ...(typeof status !== 'undefined' ? { status } : {}),
      },
      { new: true },
    ).lean();

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    clearAllStatsCaches();

    return NextResponse.json({
      message: 'Role updated.',
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error('Admin user PATCH error:', error);

    return NextResponse.json(
      { error: 'Failed to update user.' },
      { status: 500 },
    );
  }
}
