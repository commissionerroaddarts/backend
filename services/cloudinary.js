
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


function getPublicId(url) {
  const match = url.match(/\/upload\/v\d+\/(.+)\.(jpg|png|jpeg|webp|gif)/);
  return match ? match[1] : null;
}

export const uploadToCloudinary = async (fileBuffer, public_id) => {
  try {
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          public_id,
          overwrite: true, // Replaces the old image if exists
          resource_type: 'image',
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      uploadStream.end(fileBuffer);
    });

    // const result = await cloudinary.uploader.upload(base64String, {
    //   public_id,
    //   overwrite: true,
    //   resource_type: 'image'
    // });

    // Return the URL of the uploaded image
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
};

// Function to delete user profile image
export const deleteImage = async (url) => {
  try {
    const publicId = getPublicId(url);
    if (!publicId) {
      console.error('Invalid image URL:', url);
      return { success: false, message: 'Invalid image URL' };
    }
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok') {
      console.log('Image deleted successfully');
      return { success: true, message: 'Image deleted successfully' };
    } else {
      console.log('Image deletion failed:', result);
      return { success: false, message: 'Image deletion failed' };
    }
  } catch (error) {
    console.error('Error deleting image:', error.message);
    return { success: false, message: `Error: ${error.message}` };
  }
};