import mongoose from "mongoose";

const comboOrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  comboOrderNumber: { type: String, required: true },
  comboAmount: { type: Number, default: 0 },
  shortageAmount: { type: Number, default: 0 },
  commission: { type: Number, default: 0 },
  rechargeNeeded: { type: Number, default: 0 },
  expectedIncome: { type: Number, default: 0 },
  productList: [{ image: String, name: String, unitPrice: Number, quantity: Number, subtotal: Number }],
  status: { type: String, enum: ["pending", "incomplete", "completed"], default: "pending" },
  orderNumber: { type: String },
  transactionTime: { type: Date },
}, { timestamps: true });

export default mongoose.models.ComboOrder || mongoose.model("ComboOrder", comboOrderSchema);