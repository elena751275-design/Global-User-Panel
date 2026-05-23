import mongoose from "mongoose";

const invitationCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  uses: {
    type: Number,
    default: 0,
  },
  maxUses: {
    type: Number,
    default: 1, // By default, a code can be used only once
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.InvitationCode ||
  mongoose.model("InvitationCode", invitationCodeSchema);
