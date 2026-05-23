import mongoose from "mongoose";

const withdrawalSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    walletName: { type: String, default: '' },
    walletAddress: { type: String, default: '' },
    walletNetwork: { type: String, default: '' },
    customerName: { type: String, default: '' },
    status: { type: String, enum: ["pending", "approved", "rejected", "completed"], default: "pending" },
  },
  { timestamps: true },
);

export default mongoose.models.WithdrawalRequest || mongoose.model("WithdrawalRequest", withdrawalSchema);