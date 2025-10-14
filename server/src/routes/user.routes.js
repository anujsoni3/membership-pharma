import { Router } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { Readable } from 'stream';
import { authRequired } from '../middleware/auth.js';
import { User } from '../models/User.js';
import { Education } from '../models/Education.js';
import { Experience } from '../models/Experience.js';
import { ShareLink } from '../models/ShareLink.js';
import { createShareLink, expireOldLinks } from '../services/shareLinkService.js';
import { upload, deleteLocalFile, toPublicUrl, uploadToCloudIfEnabled } from '../config/storage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();
router.use(authRequired);

router.get('/profile', async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).lean();
    const education = await Education.find({ user_id: req.user.id }).sort({ start_date: -1 }).lean();
    const experience = await Experience.find({ user_id: req.user.id }).sort({ start_date: -1 }).lean();
    res.json({ user, education, experience });
  } catch (e) { next(e); }
});

router.put('/profile', async (req, res, next) => {
  try {
    const allowed = ['full_name', 'phone_number', 'qualification'];
    const updates = {};
    for (const k of allowed) if (k in req.body) updates[k] = req.body[k];
    await User.updateOne({ _id: req.user.id }, { $set: updates });
    res.json({ message: 'Profile updated' });
  } catch (e) { next(e); }
});

router.post('/education', async (req, res, next) => {
  try {
    const { type, institution, degree, start_date, end_date } = req.body;
    if (!type || !start_date || !end_date) throw new Error('Missing required fields');
    const edu = await Education.create({ user_id: req.user.id, type, institution, degree, start_date, end_date });
    res.json({ education: edu });
  } catch (e) { next(e); }
});

router.put('/education/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await Education.updateOne({ _id: id, user_id: req.user.id }, { $set: req.body });
    res.json({ message: 'Education updated' });
  } catch (e) { next(e); }
});

router.delete('/education/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await Education.deleteOne({ _id: id, user_id: req.user.id });
    res.json({ message: 'Education deleted' });
  } catch (e) { next(e); }
});

router.post('/experience', async (req, res, next) => {
  try {
    const { title, company, start_date, end_date, description, linkedin_url } = req.body;
    if (!title || !company || !start_date || !end_date) throw new Error('Missing required fields');
    const exp = await Experience.create({ user_id: req.user.id, title, company, start_date, end_date, description, linkedin_url });
    res.json({ experience: exp });
  } catch (e) { next(e); }
});

router.put('/experience/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await Experience.updateOne({ _id: id, user_id: req.user.id }, { $set: req.body });
    res.json({ message: 'Experience updated' });
  } catch (e) { next(e); }
});

router.delete('/experience/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await Experience.deleteOne({ _id: id, user_id: req.user.id });
    res.json({ message: 'Experience deleted' });
  } catch (e) { next(e); }
});

router.get('/resume/download', async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).lean();
    if (!user?.resume_url) return res.status(404).json({ error: 'No resume uploaded' });
    const url = user.resume_url;
    if (/^https?:\/\//i.test(url)) {
      // Stream remote file through server and force download
      const upstream = await fetch(url);
      if (!upstream.ok) return res.status(upstream.status).json({ error: `Upstream error ${upstream.status}` });
      const ct = upstream.headers.get('content-type') || (url.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream');
      res.setHeader('Content-Type', ct);
      res.setHeader('Content-Disposition', `attachment; filename="${path.basename(new URL(url).pathname)}"`);
      return Readable.fromWeb(upstream.body).pipe(res);
    }
    // Local file under /uploads/... -> map to disk path and download
    const rel = url.replace(/^\//, ''); // remove leading slash
    const abs = path.join(__dirname, '..', rel);
    const filename = path.basename(rel);
    return res.download(abs, filename);
  } catch (e) { next(e); }
});

router.get('/resume/view', async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).lean();
    if (!user?.resume_url) return res.status(404).json({ error: 'No resume uploaded' });
    const url = user.resume_url;
    if (/^https?:\/\//i.test(url)) {
      // Stream remote file; set inline for PDFs, attachment otherwise
      const upstream = await fetch(url);
      if (!upstream.ok) return res.status(upstream.status).json({ error: `Upstream error ${upstream.status}` });
      const pathname = new URL(url).pathname.toLowerCase();
      const ct = upstream.headers.get('content-type') || (pathname.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream');
      res.setHeader('Content-Type', ct);
      if (!/pdf/i.test(ct) && !pathname.endsWith('.pdf')) {
        res.setHeader('Content-Disposition', `attachment; filename="${path.basename(pathname)}"`);
      }
      return Readable.fromWeb(upstream.body).pipe(res);
    }
    const rel = url.replace(/^\//, '');
    const abs = path.join(__dirname, '..', rel);
    // If PDF, set inline content type; otherwise fall back to download
    if (/\.pdf$/i.test(rel)) {
      res.setHeader('Content-Type', 'application/pdf');
      return res.sendFile(abs);
    }
    return res.download(abs, path.basename(rel));
  } catch (e) { next(e); }
});

router.post('/upload', upload.fields([{ name: 'resume', maxCount: 1 }, { name: 'photo', maxCount: 1 }]), async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    // Handle resume
    if (req.files?.resume?.[0]) {
      if (req.files.resume[0].size > 5 * 1024 * 1024) throw new Error('Resume size exceeds 5MB');
      // optionally upload to Cloudinary
      const resumePath = req.files.resume[0].path.replace(/\\/g, '/');
      const cloud = await uploadToCloudIfEnabled(resumePath, 'resumes');
      if (cloud.url) {
        deleteLocalFile(resumePath);
        user.resume_url = cloud.url;
      } else {
        user.resume_url = toPublicUrl(resumePath.startsWith('uploads/') ? resumePath : `uploads/resumes/${path.basename(resumePath)}`);
      }
    }

    // Handle photo
    if (req.files?.photo?.[0]) {
      if (req.files.photo[0].size > 2 * 1024 * 1024) throw new Error('Photo size exceeds 2MB');
      const photoPath = req.files.photo[0].path.replace(/\\/g, '/');
      const cloud = await uploadToCloudIfEnabled(photoPath, 'photos');
      if (cloud.url) {
        deleteLocalFile(photoPath);
        user.photo_url = cloud.url;
      } else {
        user.photo_url = toPublicUrl(photoPath.startsWith('uploads/') ? photoPath : `uploads/photos/${path.basename(photoPath)}`);
      }
    }

    await user.save();
    res.json({ message: 'Files updated', resume_url: user.resume_url, photo_url: user.photo_url });
  } catch (e) { next(e); }
});

router.post('/share-links', async (req, res, next) => {
  try {
    const { days } = req.body; // 1 or 2
    if (![1, 2].includes(Number(days))) throw new Error('Invalid share duration');
    await expireOldLinks();
    const link = await createShareLink(req.user.id, Number(days));
    res.json({ link });
  } catch (e) { next(e); }
});

router.get('/share-links', async (req, res, next) => {
  try {
    await expireOldLinks();
    const links = await ShareLink.find({ user_id: req.user.id }).sort({ created_at: -1 }).lean();
    res.json({ links });
  } catch (e) { next(e); }
});

router.delete('/share-links/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await ShareLink.updateOne({ _id: id, user_id: req.user.id }, { $set: { status: 'revoked' } });
    res.json({ message: 'Share link revoked' });
  } catch (e) { next(e); }
});

export default router;
