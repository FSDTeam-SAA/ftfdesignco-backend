const { sendImageToCloudinary } = require("../../utils/cloudnary");
const AssignedProduct = require("../assignedProduct/assignedProduct.model");
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

  if (user.isPaid === false) {
    throw new Error("Please buy a subscription.");
  }

  const shop = await Shop.findById(user.shop);
  if (!shop) throw new Error("Shop not found.");
  console.log(shop);

  if (!shop.status === "approved") {
    throw new Error("Shop is not approved yet.");
  }

  const now = new Date();
  if (shop.subscriptionEndDate && shop.subscriptionEndDate < now) {
    throw new Error("Your subscription has expired. Please renew your plan.");
  }

  const totalEmployee = await User.findOne({ email }).select("employeeCount");
  if (totalEmployee.employeeCount >= shop.subscriptionEmployees) {
    throw new Error("You have to reach your subscription limit.");
  }

  const isExistEmployee = await Employee.findOne({ email: payload.email });
  if (isExistEmployee) {
    throw new Error("Employee with this email already exists.");
  }

  const isExistEmployeeId = await Employee.findOne({
    employeeId: payload.employeeId,
    shop: shop._id,
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
    {
      $inc: { coin: payload.coin, remainingCoin: payload.coin },
    },
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

const getEmployeeProfile = async (employeeId) => {
  const employee = await Employee.findOne({ employeeId }).populate({
    path: "shop",
    select: "companyName companyId",
  });
  if (!employee) throw new Error("Employee not found.");

  return employee;
};

const getEmployeeShopProducts = async (
  employeeId,
  shop,
  page = 1,
  limit = 10
) => {
  // Validate inputs
  page = Math.max(1, parseInt(page));
  limit = Math.max(1, parseInt(limit));

  // Verify shop exists
  const shopData = await Shop.findById(shop);
  if (!shopData) throw new Error("Shop not found.");

  // Verify employee exists and belongs to shop owner
  const employee = await Employee.findOne({ employeeId, shop });
  if (!employee) throw new Error("Employee not found.");

  if (!employee.userId.equals(shopData.userId)) {
    throw new Error("You are not the owner of this employee.");
  }

  // Get total count of products for pagination info
  const totalProducts = await AssignedProduct.countDocuments({ shopId: shop });

  // Get paginated products with population
  const products = await AssignedProduct.find({ shopId: shop })
    .populate("productId")
    .skip((page - 1) * limit)
    .limit(limit)
    .exec();

  return {
    products,
    currentPage: page,
    totalPages: Math.ceil(totalProducts / limit),
    totalProducts,
  };
};

const updateEmployeeOwnProfile = async (employeeId, payload, file) => {
  const employee = await Employee.findOne({ employeeId });
  if (!employee) throw new Error("Employee not found.");

  if (file) {
    const imageName = `${Date.now()}-${file.originalname}`;
    const path = file?.path;
    const { secure_url } = await sendImageToCloudinary(imageName, path);
    payload.imageLink = secure_url;
  }

  const result = await Employee.findByIdAndUpdate(employee._id, payload, {
    new: true,
  })
    .populate({
      path: "shop",
      select: "companyName companyId",
    })
    .populate({
      path: "userId",
      select: "name email",
    });

  return result;
};

const deletedEmployee = async (employeeId, email) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  const orderData = await Order.findOne({ employeeId });
  if (orderData) {
    throw new Error(
      "Cannot delete employee because there are existing orders assigned"
    );
  }

  const result = await Employee.findOneAndDelete({
    _id: employeeId,
    shop: user.shop,
  });

  if (!result) {
    throw new error("Employee is not exist");
  }
};

const employeeService = {
  createEmployeeInDb,
  getMyEmployees,
  employeeCoinGive,
  getEmployeeProfile,
  getEmployeeShopProducts,
  updateEmployeeOwnProfile,
  deletedEmployee,
};
module.exports = employeeService;
