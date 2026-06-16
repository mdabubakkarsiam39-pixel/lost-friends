import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config';

if (config.cloudinary.cloudName) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
  });
}

export async function uploadToCloudinary(
  fileBuffer: Buffer,
  folder: string = 'lost-friends',
  options: { resource_type?: string; format?: string } = {}
): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    const uploadOptions: any = {
      folder,
      ...options,
    };

    if (options.resource_type === 'video') {
      uploadOptions.resource_type = 'video';
      uploadOptions.eager = [{ format: 'mp4', transformation: [{ quality: 'auto' }] }];
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error('Upload failed'));
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    uploadStream.end(fileBuffer);
  });
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

export default cloudinary;