import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    companyName: {
      type: String,
      default: null,
      trim: true,
    },
    companyAddress: {
      type: String,
      default: null,
      trim: true,
    },
    role: {
      type: String,
      enum: ["customer", "business", "admin", "driver"],
      default: "customer",
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;