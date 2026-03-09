import { v2 as cloudinary } from 'cloudinary';

export const deleteImage = async (fileUrl) => {
    if (!fileUrl || !fileUrl.includes("cloudinary")) return;

    try {
        // Extract public_id from URL
        // Example: .../upload/v162/folder/img_name.jpg -> folder/img_name
        const parts = fileUrl.split('/');
        const lastPart = parts.pop(); // img_name.jpg
        const folderPart = parts.pop(); // folder
        const publicId = `${folderPart}/${lastPart.split('.')[0]}`;

        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error("Cloudinary Delete Error:", error);
    }
};