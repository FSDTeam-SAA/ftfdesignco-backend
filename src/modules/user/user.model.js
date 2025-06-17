const { Schema, model } = require("mongoose");

const userModel = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    isVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    otp: { type: String, default: null },
    otpExpires: { type: Date, default: null },
    role: {
      type: String,
      enum: ["company_admin", "admin", "employes"],
      default: "employes",
    },
    shop: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
    },
    isHaveShop: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, versionKey: false }
);

const User = model("User", userModel);
module.exports = User;
