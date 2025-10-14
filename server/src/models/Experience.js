import mongoose from 'mongoose';

const ExperienceSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  company: { type: String, required: true },
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
  description: { type: String },
  linkedin_url: { type: String },
}, { timestamps: true });

export const Experience = mongoose.model('Experience', ExperienceSchema);
