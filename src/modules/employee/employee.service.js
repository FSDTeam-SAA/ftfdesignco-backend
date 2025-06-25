const { default: mongoose } = require("mongoose");
const { Payment } = require("../payment/payment.model");
const Shop = require("../shop/shop.model");
const User = require("../user/user.model");
const Employee = require("./employee.model");

const createEmployeeInDb = async (email, payload) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  if (!user.isShopCreated) {
    throw new Error("You need to create a shop first.");
  }

  const shop = await Shop.findById(user.shop);
  if (!shop) throw new Error("Shop not found.");

  if (!shop.status === "approved") {
    throw new Error("Shop is not approved yet.");
  }

  const payment = await Payment.findOne({ userId: user._id });
  if (!payment) throw new Error("Payment not found.");

  if (payment.status !== "success") {
    throw new Error("Payment is not success.");
  }

  const now = new Date();
  if (shop.subscriptionEndDate && shop.subscriptionEndDate < now) {
    throw new Error("Your subscription has expired. Please renew your plan.");
  }

  const totalEmployee = await User.findOne({ email }).select("employeeCount");
  if (totalEmployee.employeeCount >= shop.subscriptionEmployees) {
    throw new Error("You have to rach your subscription limit.");
  }

  const isExistEmployee = await Employee.findOne({ email: payload.email });
  if (isExistEmployee) {
    throw new Error("Employee with this email already exists.");
  }

  const isExistEmployeeId = await Employee.findOne({
    employeeId: payload.employeeId,
  });
  if (isExistEmployeeId) {
    throw new Error(`Employee ${payload.employeeId} already exists`);
  }

  const newEmployee = await Employee.create({
    ...payload,
    shop: shop._id,
    userId: user._id,
  });

  await User.findByIdAndUpdate(
    user._id,
    { $inc: { employeeCount: 1 } },
    { new: true }
  );

  const result = await Employee.findById(newEmployee._id)
    .populate({ path: "shop", select: "companyName" })
    .populate({ path: "userId", select: "name email" });

  return result;
};

const getMyEmployees = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  if (!user.isShopCreated) {
    throw new Error("You need to create a shop first");
  }
  if (!user.shop) throw new Error("Shop not found");

  const employees = await Employee.find({ shop: user.shop._id })
    .populate({ path: "shop", select: "companyName companyId" })
    .populate({ path: "userId", select: "name email" });

  return employees;
};

const employeeCoinGive = async (email, payload, employeeId) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  if (!user.isShopCreated) {
    throw new Error("You need to create a shop first");
  }

  const shop = await Shop.findById(user.shop);
  if (!shop) throw new Error("Shop not found");

  const employee = await Employee.findById(employeeId);
  if (!employee) throw new Error("Employee not found");

  if (!employee.userId.equals(user._id)) {
    throw new Error("You are not the owner of this employee");
  }

  const result = await Employee.findByIdAndUpdate(
    employeeId,
    { $inc: { coin: payload.coin } },
    { new: true }
  )
    .populate({
      path: "shop",
      select: "companyName companyId",
    })
    .populate({
      path: "userId",
      select: "name email",
    });

  await Shop.findByIdAndUpdate(
    shop._id,
    { $inc: { totalGivenCoin: payload.coin } },
    { new: true }
  );

  return result;
};

const employeeService = {
  createEmployeeInDb,
  getMyEmployees,
  employeeCoinGive,
};
module.exports = employeeService;
