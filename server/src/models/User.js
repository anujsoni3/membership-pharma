import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true, minlength: 3 },
  password_hash: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  email_verified: { type: Boolean, default: false },
  member_id: { type: String, unique: true, sparse: true },
  full_name: { type: String },
  phone_number: { type: String },
  qualification: { type: String },
  resume_url: { type: String },
  photo_url: { type: String },
  is_blocked: { type: Boolean, default: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export const User = mongoose.model('User', UserSchema);
