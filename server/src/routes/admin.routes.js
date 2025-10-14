import { Router } from 'express';
import { adminRequired, authRequired } from '../middleware/auth.js';
import { User } from '../models/User.js';
import { Education } from '../models/Education.js';
import { Experience } from '../models/Experience.js';
import { ShareLink } from '../models/ShareLink.js';
import { sendMail } from '../services/emailService.js';
import { blockedEmail } from '../utils/emailTemplates.js';

const router = Router();
router.use(authRequired, adminRequired);

router.get('/summary', async (req, res, next) => {
  try {
    const total = await User.countDocuments({ role: 'user' });
    const active = await User.countDocuments({ role: 'user', email_verified: true, is_blocked: false });
    const inactive = await User.countDocuments({ role: 'user', email_verified: false });
    const blocked = await User.countDocuments({ role: 'user', is_blocked: true });
    res.json({ total, active, inactive, blocked });
  } catch (e) { next(e); }
});

router.get('/users', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', sort = 'created_at', order = 'desc' } = req.query;
    const q = { role: 'user' };
    if (search) {
      q.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { full_name: { $regex: search, $options: 'i' } },
        { member_id: { $regex: search, $options: 'i' } },
      ];
    }
    const skip = (Number(page) - 1) * Number(limit);
    const users = await User.find(q)
      .sort({ [sort]: order === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();
    const total = await User.countDocuments(q);
    res.json({ users, total });
  } catch (e) { next(e); }
});

router.put('/users/:id', async (req, res, next) => {
  try {
    const allowed = ['full_name', 'phone_number', 'qualification', 'email_verified', 'is_blocked'];
    const updates = {};
    for (const k of allowed) if (k in req.body) updates[k] = req.body[k];

    await User.updateOne({ _id: req.params.id, role: 'user' }, { $set: updates });

    // If blocked set to true, notify user
    if (req.body.is_blocked === true) {
      const user = await User.findById(req.params.id);
      if (user) {
        const tmpl = blockedEmail({ name: user.full_name || user.username });
        await sendMail({ to: user.email, ...tmpl });
      }
    }

    res.json({ message: 'User updated' });
  } catch (e) { next(e); }
});

router.delete('/users/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await Education.deleteMany({ user_id: id });
    await Experience.deleteMany({ user_id: id });
    await ShareLink.deleteMany({ user_id: id });
    await User.deleteOne({ _id: id, role: 'user' });
    res.json({ message: 'User deleted' });
  } catch (e) { next(e); }
});

export default router;
