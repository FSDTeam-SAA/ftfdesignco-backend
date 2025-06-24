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
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  needPasswordChange: {
    type: Boolean,
    default: true,
  },
  role: {
    type: String,
    default: "employee",
  },
  shop: {
    type: Schema.Types.ObjectId,
    ref: "Shop",
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
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
