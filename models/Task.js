import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    level: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    orders_per_day: {
      type: Number,
      required: true,
    },
    commission_rate: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true },
);

export default mongoose.models.Task || mongoose.model("Task", taskSchema);
