const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt");

const employeeModel = new Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
  },
  employeeId: {
    type: String,
    required: [true, "Employee ID is required"],
    // unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  needPasswordChange: {
    type: Boolean,
    default: true,
  },
  country: {
    type: String,
  },
  city: {
    type: String,
  },
  roadOrArea: {
    type: String,
  },
  postalCode: {
    type: String,
  },
  imageLink: { type: String, default: null },
  phone: {
    type: String,
  },
  role: {
    type: String,
    default: "employee",
  },
  coin: {
    type: Number,
    default: 0,
    min: [0, "Coin cannot be negative"],
  },
  remainingCoin: {
    type: Number,
    default: 0,
    min: [0, "Remaining coin cannot be negative"],
  },
  totalOrder: {
    type: Number,
    default: 0,
    min: [0, "Total order cannot be negative"],
  },
  shop: {
    type: Schema.Types.ObjectId,
    ref: "Shop",
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  cartData: {
    type: Map,
    of: new Schema({
      quantity: Number,
      // size: String,
      totalCoin: Number,
      productId: {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    }),
    default: {},
  },
});

employeeModel.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

employeeModel.post("save", function (doc, next) {
  doc.password = "";
  next();
});

const Employee = model("Employee", employeeModel);
module.exports = Employee;
