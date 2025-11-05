// middleware/upload.js
import multer from 'multer';
import fs from 'fs';
import path from 'path';

// Use memory storage for Vercel (serverless), disk storage for regular servers
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true' || process.env.VERCEL;

const storage = isVercel 
  ? multer.memoryStorage() // Vercel: use memory storage (read-only filesystem)
  : multer.diskStorage({
      // Regular server: use disk storage
      destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueFilename = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueFilename);
      },
    });

const fileFilter = (req, file, cb) => {
  console.log('File received:', file.originalname, file.mimetype);
  if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
      file.mimetype === 'application/vnd.ms-excel') {
    cb(null, true);
  } else {
    cb(new Error('केवल Excel फाइलें (.xlsx, .xls) की अनुमति है'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

export default upload;