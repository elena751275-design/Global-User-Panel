import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true }, // Links to the Auth Provider ID
  username: { type: String },
  balance: { type: Number, default: 0 },
  vip_level: { type: Number, default: 1 },
  combo_slots: { type: [Number], default: [] }, // Array of task indices that are 'Combo'
  tasks_completed_today: { type: Number, default: 0 },
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);