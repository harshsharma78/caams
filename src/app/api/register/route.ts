import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { registerSchema } from '@/lib/validations';
import User from '@/models/User';

/**
 * Registers a new CAAMS user with a hashed password.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid input.' },
        { status: 400 },
      );
    }

    await dbConnect();
    const session = await auth();
    const userCount = await User.countDocuments();

    const existingUser = await User.findOne({
      email: parsed.data.email.toLowerCase(),
    }).lean();

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(parsed.data.password, 12);
    const role =
      userCount === 0 || session?.user?.role === 'admin'
        ? parsed.data.role
        : 'viewer';

    const user = await User.create({
      ...parsed.data,
      role,
      email: parsed.data.email.toLowerCase(),
      password: hashedPassword,
    });

    return NextResponse.json(
      {
        message: 'User registered successfully.',
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Register API error:', error);

    return NextResponse.json(
      { error: 'Failed to register user.' },
      { status: 500 },
    );
  }
}
