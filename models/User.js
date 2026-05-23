import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: false,
    unique: false,
    trim: true,
    lowercase: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true,
    // Basic email validation
    match: [/.+\@.+\..+/, "Please enter a valid email address"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  fundPassword: {
    type: String,
    required: false,
  },
  invitationCode: {
    type: String,
    // This field is now optional
  },
  role: {
    type: String,
    enum: {
      values: ["customer", "admin", "agent"],
      message: "{VALUE} is not a supported role",
    },
    default: "customer",
  },
  level: {
    type: Number,
    default: 1,
  },
  balance: {
    type: Number,
    default: 0,
  },
  total_commission: {
    type: Number,
    default: 0,
  },
  dailyOrderCount: {
    type: Number,
    default: 0,
  },
  lastOrderDate: {
    type: String,
    default: '',
  },
  walletAddress: {
    type: String,
    required: false,
  },
  walletNetwork: {
    type: String,
    required: false,
  },
  walletName: {
    type: String,
    required: false,
  },
  customerName: {
    type: String,
    required: false,
  },
  withdrawalPassword: {
    type: String,
    required: false,
  },
  isWalletBound: {
    type: Boolean,
    default: false,
  },
  pendingComboOrder: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  avatarUrl: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// The following line prevents Mongoose from recompiling the model if it's already been compiled.
// This is useful in development environments where files might be re-required.
export default mongoose.models.User || mongoose.model("User", userSchema);
