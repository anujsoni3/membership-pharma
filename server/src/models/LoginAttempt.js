import mongoose from 'mongoose';

const LoginAttemptSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  username_or_email: { type: String },
  ip: { type: String },
  user_agent: { type: String },
  success: { type: Boolean, default: false },
  blocked: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
});

export const LoginAttempt = mongoose.model('LoginAttempt', LoginAttemptSchema);
