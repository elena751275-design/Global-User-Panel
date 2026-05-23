import mongoose from "mongoose";

const depositSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    tx_id: { type: String, required: false },
    walletAddress: { type: String, default: '' },
    status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
  },
  { timestamps: true },
);

export default mongoose.models.Deposit || mongoose.model("Deposit", depositSchema);
