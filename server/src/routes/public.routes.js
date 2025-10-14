import { Router } from 'express';
import { ShareLink } from '../models/ShareLink.js';
import { User } from '../models/User.js';
import { Education } from '../models/Education.js';
import { Experience } from '../models/Experience.js';

const router = Router();

router.get('/profile/:token', async (req, res, next) => {
  try {
    const { token } = req.params;
    const link = await ShareLink.findOne({ token }).lean();
    if (!link || link.status !== 'active' || new Date(link.expires_at) < new Date()) {
      return res.status(404).json({ error: 'Link not found or expired' });
    }
    const user = await User.findById(link.user_id).lean();
    const education = await Education.find({ user_id: link.user_id }).sort({ start_date: -1 }).lean();
    const experience = await Experience.find({ user_id: link.user_id }).sort({ start_date: -1 }).lean();
    res.json({
      profile: {
        full_name: user.full_name,
        qualification: user.qualification,
        phone_number: user.phone_number,
        email: user.email,
        member_id: user.member_id,
        resume_url: user.resume_url,
        photo_url: user.photo_url,
      },
      education,
      experience,
    });
  } catch (e) { next(e); }
});

export default router;
