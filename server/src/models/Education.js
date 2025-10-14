import mongoose from 'mongoose';

const EducationSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, required: true },
  institution: { type: String },
  degree: { type: String },
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
}, { timestamps: true });

export const Education = mongoose.model('Education', EducationSchema);
