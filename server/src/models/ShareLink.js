import mongoose from 'mongoose';

const ShareLinkSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  token: { type: String, unique: true, required: true },
  created_at: { type: Date, default: Date.now },
  expires_at: { type: Date, required: true },
  status: { type: String, enum: ['active', 'revoked', 'expired'], default: 'active' },
}, { timestamps: false });

export const ShareLink = mongoose.model('ShareLink', ShareLinkSchema);
