import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { canManageOrganizations } from '@/lib/permissions';

/**
 * Accepts multipart file uploads and stores them in Cloudinary.
 */
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user || !canManageOrganizations(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: 'A file upload is required.' },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const url = await uploadToCloudinary(
      Buffer.from(arrayBuffer),
      'caams/organizations',
      file.name,
    );

    return NextResponse.json({ url }, { status: 201 });
  } catch (error) {
    console.error('Cloudinary upload error:', error);

    return NextResponse.json(
      { error: 'Failed to upload file.' },
      { status: 500 },
    );
  }
}
