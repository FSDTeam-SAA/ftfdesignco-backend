const { Schema, model } = require("mongoose");

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
  needPasswordChange: {
    type: Boolean,
    default: true,
  },
  role: {
    type: String,
    default: "employee",
  },
  companyId: {
    type: Schema.Types.ObjectId,
    ref: "Shop",
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

const Employee = model("Employee", employeeModel);
module.exports = Employee;
