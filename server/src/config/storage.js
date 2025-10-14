import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './env.js';
import { v2 as cloudinary } from 'cloudinary';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseUploads = path.join(__dirname, '..', 'uploads');
const resumeDir = path.join(baseUploads, 'resumes');
const photoDir = path.join(baseUploads, 'photos');

for (const dir of [baseUploads, resumeDir, photoDir]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

const useCloudinary = Boolean(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET);

if (useCloudinary) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'resume') cb(null, resumeDir);
    else cb(null, photoDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    cb(null, name);
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // max 5MB (resume); photo checks done in route
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'resume') {
      const ok = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.mimetype);
      if (!ok) return cb(new Error('Invalid resume file type'));
    }
    if (file.fieldname === 'photo') {
      const ok = ['image/jpeg', 'image/png'].includes(file.mimetype);
      if (!ok) return cb(new Error('Invalid photo file type'));
    }
    cb(null, true);
  },
});

export const deleteLocalFile = (filepath) => {
  if (!filepath) return;
  try { fs.unlinkSync(filepath.startsWith('/') || filepath.match(/^.:\\/) ? filepath : path.join(__dirname, '..', filepath)); } catch {}
};

export const toPublicUrl = (localPath) => {
  // Expects paths like uploads/resumes/xxx.pdf
  if (!localPath) return null;
  const normalized = localPath.replace(/\\/g, '/');
  if (normalized.startsWith('uploads/')) return `/${normalized}`;
  return `/uploads/${normalized}`;
};

export const uploadToCloudIfEnabled = async (filePath, folder) => {
  if (!useCloudinary) return { url: null, provider: 'local' };
  try {
    // resource_type:auto lets Cloudinary handle images, pdf, docx, etc.
    const res = await cloudinary.uploader.upload(filePath, { folder, resource_type: 'auto' });
    return { url: res.secure_url, provider: 'cloudinary' };
  } catch (e) {
    // Cloud upload failed; fall back to local
    return { url: null, provider: 'local', error: e?.message };
  }
};
