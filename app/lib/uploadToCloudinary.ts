// lib/uploadToCloudinary.ts
import cloudinary from './cloudinary';

/**
 * Upload an image file (Buffer) to Cloudinary
 * @param file - Image file as Buffer
 * @param fileName - Original filename (used for public_id)
 * @returns Promise<string> - Cloudinary secure URL
 */
export async function uploadImage(
    file: Buffer,
    fileName: string
): Promise<string> {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'mexico-travel-guide', // Organize in folders
                public_id: fileName.replace(/\.[^/.]+$/, ''), // Remove extension
                resource_type: 'image',
                format: 'webp', // Auto-convert to WebP!
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result!.secure_url);
            }
        );

        uploadStream.end(file);
    });
}

/**
 * Upload an image from a URL to Cloudinary
 * Fetches the image from the URL and uploads it to Cloudinary
 * @param imageUrl - URL of the image to upload
 * @param fileName - Optional custom filename (defaults to timestamp-based name)
 * @returns Promise<string> - Cloudinary secure URL
 */
export async function uploadImageFromUrl(
    imageUrl: string,
    fileName?: string
): Promise<string> {
    try {
        // Fetch the image from the URL
        const response = await fetch(imageUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`);
        }

        // Convert response to buffer
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Generate filename if not provided
        const finalFileName = fileName || `image-${Date.now()}`;

        // Upload to Cloudinary
        return await uploadImage(buffer, finalFileName);
    } catch (error) {
        throw new Error(`Failed to upload image from URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}