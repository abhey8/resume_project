const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Expense title is required"],
      trim: true,
      maxlength: 100,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    category: {
      type: String,
      enum: ["Food", "Travel", "Shopping", "Bills", "Entertainment", "Other"],
      default: "Other",
    },
    paymentMethod: {
      type: String,
      enum: ["Cash", "Card", "UPI", "NetBanking"],
      default: "UPI",
    },
    notes: {
      type: String,
      maxlength: 200,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false, // important security improvement
    },
    monthlyBudget: {
      type: Number,
      default: 0,
      min: 0,
    },
    expenses: [expenseSchema],
  },
  {
    timestamps: true, // adds createdAt & updatedAt automatically
  }
);

module.exports = mongoose.model("User", userSchema);
