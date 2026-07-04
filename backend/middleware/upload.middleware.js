import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage engine configuration for different file types
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folder = 'hrms/others';
    let allowedFormats = ['jpeg', 'png', 'jpg', 'pdf', 'doc', 'docx'];
    
    if (file.fieldname === 'profile_picture') {
      folder = 'hrms/avatars';
      allowedFormats = ['jpeg', 'png', 'jpg','webp'];
    } else if (file.fieldname === 'resume') {
      folder = 'hrms/resumes';
      // Specify resource_type as 'raw' for PDFs and Docs to prevent Cloudinary image conversion errors
      return {
        folder: folder,
        resource_type: 'raw',
        public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
      };
    } else if (file.fieldname === 'attachment') {
      folder = 'hrms/leaves';
      return {
        folder: folder,
        resource_type: 'raw',
        public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
      };
    }

    return {
      folder: folder,
      allowed_formats: allowedFormats,
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
    };
  },
});

// Filter file extensions before sending to Cloudinary
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'profile_picture') {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for profile picture!'), false);
    }
  } else if (file.fieldname === 'resume') {
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and Word documents are allowed for resume!'), false);
    }
  } else if (file.fieldname === 'attachment') {
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/jpg'
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, Word documents, or Images (JPEG/PNG) are allowed for attachment!'), false);
    }
  } else {
    cb(new Error('Unknown field!'), false);
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});
