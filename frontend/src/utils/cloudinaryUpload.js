import cloudinary from "../../config/cloudinary.js";
import streamifier from "streamifier";

export const uploadBufferToCloudinary = (buffer, options = {}) => {
  const folder = options.folder || "knowledge-vault";
  const filename = options.filename || `artefact-${Date.now()}`;

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: filename,
        resource_type: "auto",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};
