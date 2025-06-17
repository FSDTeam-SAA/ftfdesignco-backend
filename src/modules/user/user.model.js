const { Schema, model } = require("mongoose");
const config = require("../../config");
const bcrypt = require("bcrypt");

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
    phone: {
      type: String,
      required: true,
    },
    isVerified: {
      type: Boolean,
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

userModel.pre("save", async function (next) {
  this.password = await bcrypt.hash(
    this.password,
    Number(config.bcryptSaltRounds)
  );
  next();
});

userModel.post("save", function (doc, next) {
  doc.password = "";
  next();
});

const User = model("User", userModel);
module.exports = User;
