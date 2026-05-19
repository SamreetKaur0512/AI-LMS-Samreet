const cloudinary = require('cloudinary').v2

const CLOUDINARY_UPLOAD_TIMEOUT = 2 * 60 * 1000
const CLOUDINARY_CHUNK_SIZE = 6 * 1024 * 1024

exports.uploadImageToCloudinary  = async (file, folder, height, quality) => {
    const options = {folder};
    if(height) {
        options.height = height;
    }
    if(quality) {
        options.quality = quality;
    }
    options.timeout = CLOUDINARY_UPLOAD_TIMEOUT;

    const isVideo = file.mimetype && file.mimetype.startsWith("video/");

    if (isVideo) {
        options.resource_type = "video";
        options.chunk_size = CLOUDINARY_CHUNK_SIZE;
        return await cloudinary.uploader.upload_large(file.tempFilePath, options);
    }

    options.resource_type = "auto";
    return await cloudinary.uploader.upload(file.tempFilePath, options);
}
