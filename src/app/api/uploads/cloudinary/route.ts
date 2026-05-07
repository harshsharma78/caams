import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { canManageOrganizations } from '@/lib/permissions';

/** Maximum upload size in bytes (10 MB) — keeps within free Cloudinary quota */
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

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
    const folder =
      (formData.get('folder') as string | null)?.trim() || 'caams/organizations';

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: 'A file upload is required.' },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      const maxMB = (MAX_FILE_SIZE_BYTES / (1024 * 1024)).toFixed(0);
      return NextResponse.json(
        { error: `File size must not exceed ${maxMB} MB.` },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const url = await uploadToCloudinary(
      Buffer.from(arrayBuffer),
      folder,
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
