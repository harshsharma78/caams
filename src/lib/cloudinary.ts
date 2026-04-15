import { v2 as cloudinary } from 'cloudinary';

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  throw new Error(
    'Missing Cloudinary environment variables: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET',
  );
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

/**
 * Uploads a file buffer to Cloudinary and returns the secure URL.
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string,
  filename: string,
) {
  const dataUri = `data:application/octet-stream;base64,${buffer.toString('base64')}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    public_id: filename.replace(/\.[^/.]+$/, ''),
    resource_type: 'auto',
  });

  return result.secure_url;
}

export { cloudinary };
