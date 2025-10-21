import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import { User } from '../models/User.js';
import { Education } from '../models/Education.js';
import { Experience } from '../models/Experience.js';
import { LoginAttempt } from '../models/LoginAttempt.js';
import { env } from '../config/env.js';
import { isValidEmail, isValidPassword, isValidUsername } from '../utils/validation.js';
import { sendMail } from '../services/emailService.js';
import { verificationEmail, loginAttemptEmail } from '../utils/emailTemplates.js';
import { generateMemberId } from '../utils/memberId.js';
import { upload, deleteLocalFile, toPublicUrl, uploadToCloudIfEnabled } from '../config/storage.js';

const router = Router();

const signToken = (user) => {
  return jwt.sign({ sub: String(user._id), role: user.role }, env.JWT_SECRET, { expiresIn: '7d' });
};

router.post('/signup', upload.fields([{ name: 'resume', maxCount: 1 }, { name: 'photo', maxCount: 1 }]), async (req, res, next) => {
  try {
    const { username, password, full_name, phone_number, email, qualification } = req.body;

    if (!isValidUsername(username)) throw new Error('Invalid username');
    if (!isValidPassword(password)) throw new Error('Weak password');
    if (!isValidEmail(email)) throw new Error('Invalid email');

    const exists = await User.findOne({ $or: [{ username }, { email }] });
    if (exists) throw new Error('Username or email already in use');

    // Handle optional files first to determine URLs
    let resume_url = null;
    let photo_url = null;

    if (req.files?.resume?.[0]) {
      const f = req.files.resume[0];
      if (f.size > 5 * 1024 * 1024) throw new Error('Resume size exceeds 5MB');
      const resumePath = f.path.replace(/\\/g, '/');
      const cloud = await uploadToCloudIfEnabled(resumePath, 'resumes');
      if (cloud.url) {
        deleteLocalFile(resumePath);
        resume_url = cloud.url;
      } else {
        resume_url = toPublicUrl(resumePath.startsWith('uploads/') ? resumePath : `uploads/resumes/${path.basename(resumePath)}`);
      }
    }

    if (req.files?.photo?.[0]) {
      const f = req.files.photo[0];
      if (f.size > 2 * 1024 * 1024) throw new Error('Photo size exceeds 2MB');
      const photoPath = f.path.replace(/\\/g, '/');
      const cloud = await uploadToCloudIfEnabled(photoPath, 'photos');
      if (cloud.url) {
        deleteLocalFile(photoPath);
        photo_url = cloud.url;
      } else {
        photo_url = toPublicUrl(photoPath.startsWith('uploads/') ? photoPath : `uploads/photos/${path.basename(photoPath)}`);
      }
    }

    const password_hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      password_hash,
      email,
      full_name: full_name || '',
      phone_number: phone_number || '',
      qualification: qualification || '',
      email_verified: false,
      role: 'user',
      resume_url,
      photo_url,
    });

    // Persist dynamic education and experience if provided
    const educationArr = req.body.education ? JSON.parse(req.body.education) : [];
    const experienceArr = req.body.experience ? JSON.parse(req.body.experience) : [];

    if (Array.isArray(educationArr) && educationArr.length) {
      const docs = educationArr
        .filter(e => e && e.type && e.start_date && e.end_date)
        .map(e => ({
          user_id: user._id,
          type: e.type,
          institution: e.institution || '',
          degree: e.degree || '',
          start_date: e.start_date,
          end_date: e.end_date,
        }));
      if (docs.length) await Education.insertMany(docs);
    }

    if (Array.isArray(experienceArr) && experienceArr.length) {
      const docs = experienceArr
        .filter(x => x && x.title && x.company && x.start_date && x.end_date)
        .map(x => ({
          user_id: user._id,
          title: x.title,
          company: x.company,
          start_date: x.start_date,
          end_date: x.end_date,
          description: x.description || '',
          linkedin_url: x.linkedin_url || '',
        }));
      if (docs.length) await Experience.insertMany(docs);
    }

    // send verification email (JWT link)
    const vtoken = jwt.sign({ sub: String(user._id), type: 'verify' }, env.JWT_SECRET, { expiresIn: '2d' });
    const verifyUrl = `${env.BACKEND_URL}/verify?token=${vtoken}`;
    const tmpl = verificationEmail({ name: user.full_name || user.username, url: verifyUrl });
    await sendMail({ to: user.email, ...tmpl });

    return res.json({ message: 'Signup successful. Please check your email to verify.' });
  } catch (e) { next(e); }
});

router.get('/verify', async (req, res, next) => {
  try {
    const { token } = req.query;
    const payload = jwt.verify(String(token), env.JWT_SECRET);
    if (payload.type !== 'verify') throw new Error('Invalid token');
    const user = await User.findById(payload.sub);
    if (!user) throw new Error('User not found');
    if (!user.email_verified) {
      user.email_verified = true;
      if (!user.member_id) user.member_id = generateMemberId();
      await user.save();
    }
    // redirect to client sign-in page with message
    return res.redirect(`${env.CLIENT_URL}/signin?verified=1`);
  } catch (e) { next(e); }
});

router.post('/signin', async (req, res, next) => {
  try {
    const { usernameOrEmail, password } = req.body;
    const query = isValidEmail(usernameOrEmail) ? { email: usernameOrEmail } : { username: usernameOrEmail };
    const user = await User.findOne(query);

    const success = user ? await bcrypt.compare(password, user.password_hash) : false;

    await LoginAttempt.create({
      user_id: user?._id,
      username_or_email: usernameOrEmail,
      ip: req.ip,
      user_agent: req.headers['user-agent'],
      success,
      blocked: user?.is_blocked || false,
    });

    if (!user || !success) {
      if (user) {
        const tmpl = loginAttemptEmail({ name: user.full_name || user.username, success: false });
        await sendMail({ to: user.email, ...tmpl });
      }
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.email_verified) {
      return res.status(403).json({ error: 'Please confirm your email before logging in.' });
    }

    if (user.is_blocked) {
      const { blockedAttemptEmail } = await import('../utils/emailTemplates.js');
      const tmpl = blockedAttemptEmail({ name: user.full_name || user.username });
      await sendMail({ to: user.email, ...tmpl });
      return res.status(403).json({ error: 'Your account is blocked. Please contact admin.' });
    }

    const token = signToken(user);
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const tmpl = loginAttemptEmail({ name: user.full_name || user.username, success: true });
    await sendMail({ to: user.email, ...tmpl });

    return res.json({ message: 'Login successful' });
  } catch (e) { next(e); }
});

router.post('/admin/signin', async (req, res, next) => {
  try {
    const { usernameOrEmail, password } = req.body;
    const query = /@/.test(usernameOrEmail) ? { email: usernameOrEmail } : { username: usernameOrEmail };
    const user = await User.findOne({ ...query, role: 'admin' });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ sub: String(user._id), role: 'admin' }, env.JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({ message: 'Admin login successful' });
  } catch (e) { next(e); }
});

router.get('/me', async (req, res) => {
  try {
    const token = req.cookies?.token || (req.headers.authorization?.split(' ')[1]);
    if (!token) return res.json({ authenticated: false });
    const payload = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(payload.sub).lean();
    if (!user) return res.json({ authenticated: false });
    return res.json({ authenticated: true, user: { id: user._id, role: user.role, username: user.username, email: user.email, full_name: user.full_name, member_id: user.member_id } });
  } catch {
    return res.json({ authenticated: false });
  }
});

router.post('/signout', async (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Signed out' });
});

export default router;
