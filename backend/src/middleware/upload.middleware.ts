// src/middleware/upload.middleware.ts
import multer, { FileFilterCallback } from 'multer';
import { Request, Response, NextFunction } from 'express';
import { put } from "@vercel/blob";
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();


interface MulterFileWithUrl extends Express.Multer.File {
  url?: string;
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profile-pictures');  // This directory needs to be created
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload an image.'), false);
  }
};

export const uploadProfilePicture = multer({
  storage: multer.memoryStorage(),
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
}).single('profilePicture');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5, // Max 5 files per upload
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

export const uploadToVercelBlob = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.files || !Array.isArray(req.files)) {
    next(); // Continue without uploading if no files
    return;
  }

  try {
    console.log("BLOB_READ_WRITE_TOKEN:", process.env.BLOB_READ_WRITE_TOKEN);
    
    const uploadedFiles = await Promise.all(
      req.files.map(async (file: Express.Multer.File) => {
        // Generate a unique filename
        const uniqueFilename = `${Date.now()}-${file.originalname}`;
        const blob = await put(uniqueFilename, file.buffer, {
          access: 'public',
          token: process.env.BLOB_READ_WRITE_TOKEN,
          addRandomSuffix: true, // Adds a random suffix to prevent naming conflicts
        });
        return blob.url;
      })
    );

    req.body.imageUrls = uploadedFiles;
    next();
  } catch (error) {
    console.error("Vercel Blob upload error:", error);
    res.status(500).json({ error: "Failed to upload images" });
  }
};

export { upload };
