import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { isAdmin } from '@/lib/permissions';
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

    if (role !== 'admin' && role !== 'viewer') {
      return NextResponse.json(
        { error: 'Role must be "admin" or "viewer".' },
        { status: 400 },
      );
    }

    // Prevent self-demotion
    if (parsedId.data === session.user.id && role !== 'admin') {
      return NextResponse.json(
        { error: 'You cannot change your own role.' },
        { status: 400 },
      );
    }

    await dbConnect();

    const user = await User.findByIdAndUpdate(
      parsedId.data,
      { role },
      { new: true },
    ).lean();

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Role updated.',
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
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
