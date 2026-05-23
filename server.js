import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import cors from "cors";
import dotenv from "dotenv";

// .env ফাইল লোড করার জন্য
dotenv.config();

// মডেলগুলো ইম্পোর্ট করুন
import User from "./models/User.js";
import Task from "./models/Task.js";
import Order from "./models/Order.js";
import Deposit from "./models/Deposit.js";
import Withdrawal from "./models/Withdrawal.js";
import WithdrawalRequest from "./models/WithdrawalRequest.js";
import Commission from "./models/Commission.js";
import ComboOrder from "./models/ComboOrder.js";

const app = express();
const PORT = process.env.PORT || 5001;

// মিডলওয়্যার ব্যবহার করুন
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:5183",
      "http://localhost:8080",
      "http://localhost:8081",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);
app.use(express.json());

// MongoDB সংযোগ স্থাপন
mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("Connected to MongoDB");
    // Drop old unique tx_id index on deposits
    try {
      await mongoose.connection.db.collection('deposits').dropIndex('tx_id_1');
      console.log("Dropped old tx_id unique index");
    } catch (e) {
      // Index might not exist — OK
    }
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
  });

// --- API রুটগুলো ---

// ইউজার রেজিস্ট্রেশন
app.post("/api/register", async (req, res) => {
  try {
    const { email, password, invitationCode, username } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists." });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email: normalizedEmail, password: hashedPassword, invitationCode, username });
    await newUser.save();
    res.status(201).json({ success: true, message: "User registered successfully." });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ success: false, message: "An internal server error occurred." });
  }
});

// ইউজার লগইন
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    // Case-insensitive email match (admin panel may store mixed case)
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Also try original case for backwards compatibility
      const userByCase = await User.findOne({ email });
      if (!userByCase) {
        return res.status(401).json({ success: false, message: "Invalid credentials." });
      }
      return handleLoginResponse(res, userByCase, password);
    }
    return handleLoginResponse(res, user, password);
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "An internal server error occurred." });
  }
});

async function handleLoginResponse(res, user, password) {
  // bcrypt compare for hashed passwords, fallback for legacy plaintext
  const isMatch = user.password.startsWith('$2')
    ? await bcrypt.compare(password, user.password)
    : user.password === password;
  if (!isMatch) {
    return res.status(401).json({ success: false, message: "Invalid credentials." });
  }
  res.status(200).json({
    success: true,
    message: "Login successful.",
    user: {
      id: user._id,
      _id: user._id,
      email: user.email,
      username: user.username,
      avatarUrl: user.avatarUrl,
    },
  });
}

// প্রোফাইল ডেটা পাওয়া
app.get("/api/profile/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID." });
    }
    const user = await User.findById(userId).select("-password -fundPassword");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    res.status(200).json({ success: true, profile: user });
  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({ success: false, message: "An internal server error occurred." });
  }
});

// টাস্ক ডেটা পাওয়া
app.get("/api/tasks/current/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID." });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    const task = await Task.findOne({ level: user.level, status: "active" });
    res.status(200).json({ success: true, task });
  } catch (error) {
    console.error("Get Current Task Error:", error);
    res.status(500).json({ success: false, message: "An internal server error occurred." });
  }
});

// অর্ডার হিস্টোরি পাওয়া
app.get("/api/orders/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID." });
    }
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Get Orders Error:", error);
    res.status(500).json({ success: false, message: "An internal server error occurred." });
  }
});

// ডিপোজিট রেকর্ড পাওয়া
app.get("/api/deposits/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID." });
    }
    const deposits = await Deposit.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, deposits });
  } catch (error) {
    console.error("Get Deposits Error:", error);
    res.status(500).json({ success: false, message: "An internal server error occurred." });
  }
});

// উইথড্রয়াল রেকর্ড পাওয়া
app.get("/api/withdrawals/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID." });
    }
    const withdrawals = await WithdrawalRequest.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, withdrawals });
  } catch (error) {
    console.error("Get Withdrawals Error:", error);
    res.status(500).json({ success: false, message: "An internal server error occurred." });
  }
});

// অর্ডার সাবমিট করা
app.post("/api/orders/submit", async (req, res) => {
  try {
    const { orderId, userId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: "Invalid ID format." });
    }
    const order = await Order.findById(orderId);
    const user = await User.findById(userId);
    if (!order || !user) {
      return res.status(404).json({ success: false, message: "Order or user not found." });
    }
    if (order.userId.toString() !== user._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "User not authorized for this order." });
    }
    if (order.status !== "pending") {
      return res.status(400).json({ success: false, message: "Order has already been processed." });
    }
    if (user.balance < order.amount) {
      return res.status(400).json({ success: false, message: "Insufficient balance." });
    }
    order.status = "completed";
    order.completedAt = new Date();
    user.balance += order.commission;
    user.total_commission += order.commission;
    const commissionRecord = new Commission({
      userId: user._id,
      amount: order.commission,
      source: "order_commission",
      orderId: order._id,
    });
    await order.save();
    await user.save();
    await commissionRecord.save();
    res.status(200).json({ success: true, message: "Order submitted successfully!" });
  } catch (error) {
    console.error("Submit Order Error:", error);
    res.status(500).json({ success: false, message: "An internal server error occurred." });
  }
});

// নতুন ডিপোজিট রিকোয়েস্ট
app.post("/api/deposits", async (req, res) => {
  try {
    const { userId, amount, walletAddress } = req.body;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID format." });
    }
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid deposit amount." });
    }
    const newDeposit = new Deposit({
      userId,
      amount,
      walletAddress: walletAddress || '',
      status: "pending",
    });
    await newDeposit.save();
    res.status(201).json({
      success: true,
      message: "Deposit request submitted. Please wait for admin approval.",
    });
  } catch (error) {
    console.error("Create Deposit Error:", error.message || error);
    res.status(500).json({ success: false, message: error.message || "An internal server error occurred." });
  }
});

// GET /api/deposit/wallet-address - random wallet from admin settings
app.get("/api/deposit/wallet-address", async (_req, res) => {
  try {
    const db = mongoose.connection.db;
    const settings = await db.collection('settings').findOne({});
    const addresses = [];
    if (settings?.walletMain) addresses.push({ label: 'Main Vault', address: settings.walletMain, network: 'TRC20' });
    if (settings?.walletReserve) addresses.push({ label: 'Reserve Vault', address: settings.walletReserve, network: 'BEP20' });
    if (settings?.walletAux) addresses.push({ label: 'Auxiliary Vault', address: settings.walletAux, network: 'ERC20' });
    if (settings?.walletReceiving) addresses.push({ label: 'Receiving Vault', address: settings.walletReceiving, network: 'TRC20' });
    if (addresses.length === 0) return res.status(404).json({ success: false, message: "No wallet addresses configured" });
    const random = addresses[Math.floor(Math.random() * addresses.length)];
    res.json({ success: true, ...random });
  } catch (error) { res.status(500).json({ success: false, message: "Failed to get wallet address" }); }
});

// নতুন উইথড্রয়াল রিকোয়েস্ট
app.post("/api/withdrawals", async (req, res) => {
  try {
    const { userId, amount, withdrawalPassword } = req.body;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID format." });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid withdrawal amount." });
    }
    if (!user.isWalletBound) {
      return res.status(400).json({ success: false, message: "Please bind your wallet first." });
    }
    if (!user.withdrawalPassword) {
      return res.status(400).json({ success: false, message: "Withdrawal password is not set." });
    }
    if (user.withdrawalPassword !== withdrawalPassword) {
      return res.status(400).json({ success: false, message: "Incorrect withdrawal password." });
    }
    if (user.balance < amount) {
      return res.status(400).json({ success: false, message: "Insufficient balance." });
    }

    user.balance -= amount;
    await user.save();

    const newReq = new WithdrawalRequest({
      userId,
      amount,
      walletName: user.walletName,
      walletAddress: user.walletAddress,
      walletNetwork: user.walletNetwork,
      customerName: user.customerName,
      status: "pending",
    });
    await newReq.save();

    res.status(201).json({ success: true, message: "Withdrawal request submitted successfully.", balance: user.balance });
  } catch (error) {
    console.error("Create Withdrawal Error:", error);
    res.status(500).json({ success: false, message: "An internal server error occurred." });
  }
});

// ওয়ালেট ঠিকানা যুক্ত করা
app.post("/api/wallet/bind", async (req, res) => {
  try {
    const { userId, walletAddress, network, walletName, customerName, withdrawalPassword } = req.body;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID format." });
    }
    if (!walletAddress || walletAddress.length < 20 || walletAddress.length > 120) {
      return res.status(400).json({ success: false, message: "Invalid wallet address." });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    user.walletAddress = walletAddress;
    user.walletNetwork = network;
    user.walletName = walletName;
    user.customerName = customerName || '';
    user.withdrawalPassword = withdrawalPassword || '';
    user.isWalletBound = true;
    await user.save();
    res.status(200).json({ success: true, message: "Wallet address bound successfully." });
  } catch (error) {
    console.error("Bind Wallet Error:", error);
    res.status(500).json({ success: false, message: "An internal server error occurred." });
  }
});

// লগইন পাসওয়ার্ড পরিবর্তন
app.post("/api/user/change-password", async (req, res) => {
  try {
    const { userId, oldPassword, newPassword } = req.body;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID." });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Incorrect old password." });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.status(200).json({ success: true, message: "Login password changed successfully." });
  } catch (error) {
    console.error("Change Password Error:", error);
    res.status(500).json({ success: false, message: "An internal server error occurred." });
  }
});

// ফান্ড পাসওয়ার্ড পরিবর্তন
app.post("/api/user/change-fund-password", async (req, res) => {
  try {
    const { userId, oldPassword, newPassword } = req.body;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID." });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    if (user.fundPassword) {
      const isMatch = await bcrypt.compare(oldPassword, user.fundPassword);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: "Incorrect old fund password." });
      }
    }
    user.fundPassword = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.status(200).json({ success: true, message: "Fund password changed successfully." });
  } catch (error) {
    console.error("Change Fund Password Error:", error);
    res.status(500).json({ success: false, message: "An internal server error occurred." });
  }
});

// প্রোফাইল আপডেট
app.post("/api/profile/update", async (req, res) => {
  try {
    const { userId, username, avatarUrl } = req.body;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID." });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    if (username) {
      user.username = username;
    }
    if (avatarUrl) {
      user.avatarUrl = avatarUrl;
    }
    await user.save();
    res.status(200).json({ success: true, message: "Profile updated successfully." });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ success: false, message: "An internal server error occurred." });
  }
});

// অর্ডার কমপ্লিট — ব্যালেন্স + ডেইলি কাউন্টার MongoDB-তে সেভ
app.post("/api/profile/complete-order", async (req, res) => {
  try {
    const { userId, commission, platform } = req.body;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID." });
    }
    if (!commission || typeof commission !== 'number') {
      return res.status(400).json({ success: false, message: "Commission amount is required." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // Reset daily counter if it's a new day
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    if (user.lastOrderDate !== today) {
      user.dailyOrderCount = 0;
      user.lastOrderDate = today;
    }

    // Increment counter and balance
    user.dailyOrderCount = (user.dailyOrderCount || 0) + 1;
    user.balance = (user.balance || 0) + commission;
    user.total_commission = (user.total_commission || 0) + commission;

    await user.save();

    res.status(200).json({
      success: true,
      balance: user.balance,
      dailyOrderCount: user.dailyOrderCount,
      totalCommission: user.total_commission,
      platform,
    });
  } catch (error) {
    console.error("Complete Order Error:", error);
    res.status(500).json({ success: false, message: "An internal server error occurred." });
  }
});

// অর্ডার স্ট্যাটাস — ডেইলি কাউন্ট + ব্যালেন্স
app.get("/api/profile/order-status/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID." });
    }
    const user = await User.findById(userId).select('balance dailyOrderCount lastOrderDate total_commission');
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // Reset if new day
    const today = new Date().toISOString().slice(0, 10);
    if (user.lastOrderDate !== today) {
      user.dailyOrderCount = 0;
      user.lastOrderDate = today;
      await user.save();
    }

    res.status(200).json({
      success: true,
      balance: user.balance,
      dailyOrderCount: user.dailyOrderCount || 0,
      totalCommission: user.total_commission || 0,
    });
  } catch (error) {
    console.error("Order Status Error:", error);
    res.status(500).json({ success: false, message: "An internal server error occurred." });
  }
});

// ব্যালেন্স আপডেট (commission/earnings persist)
app.post("/api/profile/update-balance", async (req, res) => {
  try {
    const { userId, delta } = req.body;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID." });
    }
    if (!delta || typeof delta !== 'number') {
      return res.status(400).json({ success: false, message: "Delta amount is required." });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    const newBalance = Math.max(0, (user.balance || 0) + delta);
    user.balance = newBalance;
    await user.save();
    res.status(200).json({ success: true, balance: newBalance });
  } catch (error) {
    console.error("Update Balance Error:", error);
    res.status(500).json({ success: false, message: "An internal server error occurred." });
  }
});

// সার্ভার চালু করুন
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// --- Combo Order API ---
// Check incomplete combo
app.get("/api/combo/incomplete/:userId", async (req, res) => {
  try {
    const combo = await ComboOrder.findOne({ userId: req.params.userId, status: "incomplete" });
    if (!combo) return res.json({ success: true, hasIncomplete: false });
    const user = await User.findById(req.params.userId).select('balance');
    res.json({
      success: true, hasIncomplete: true,
      isBlocked: (user?.balance || 0) < (combo.shortageAmount || 0),
      order: combo,
    });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Check combo match at sequence
app.get("/api/combo/check/:userId/:sequence", async (req, res) => {
  try {
    const { userId, sequence } = req.params;
    const seqNum = parseInt(sequence);
    const combo = await ComboOrder.findOne({
      userId,
      comboOrderNumber: String(seqNum),
      status: "pending",
    });
    if (!combo) return res.json({ success: true, matched: false });
    const user = await User.findById(userId).select('balance');
    // Create incomplete order
    combo.status = "incomplete";
    combo.orderNumber = `ORD-${Date.now()}`;
    combo.transactionTime = new Date();
    await combo.save();
    res.json({
      success: true, matched: true,
      comboInfo: { orderNumber: combo.comboOrderNumber, comboAmount: combo.comboAmount, rechargeShortage: combo.shortageAmount, commission: combo.commission },
      isBlocked: (user?.balance || 0) < (combo.shortageAmount || 0),
    });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Submit combo order (after recharge)
app.post("/api/combo/submit", async (req, res) => {
  try {
    const { userId, comboOrderId } = req.body;
    const combo = await ComboOrder.findById(comboOrderId);
    if (!combo || combo.status !== "incomplete") return res.status(400).json({ success: false, message: "Invalid combo" });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if ((user.balance || 0) < (combo.shortageAmount || 0)) {
      return res.status(400).json({ success: false, message: "Balance insufficient. Recharge needed: $" + combo.shortageAmount });
    }
    // Complete the order
    combo.status = "completed";
    user.balance = (user.balance || 0) + (combo.commission || 0);
    user.total_commission = (user.total_commission || 0) + (combo.commission || 0);
    await combo.save();
    await user.save();
    res.json({ success: true, message: "Combo order completed!", balance: user.balance, commission: combo.commission });
  } catch (e) { res.status(500).json({ success: false }); }
});

// List user's incomplete/completed combos
app.get("/api/combo/list/:userId", async (req, res) => {
  try {
    const combos = await ComboOrder.find({ userId: req.params.userId, status: { $ne: "pending" } }).sort({ createdAt: -1 });
    res.json({ success: true, combos });
  } catch (e) { res.status(500).json({ success: false }); }
});

// Graceful shutdown handling for cleaner restarts
process.on("SIGINT", async () => {
  console.log("\nShutting down server and closing MongoDB connection...");
  await mongoose.connection.close();
  process.exit(0);
});
