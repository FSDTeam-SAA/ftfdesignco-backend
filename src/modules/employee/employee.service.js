const User = require("../user/user.model");
const Employee = require("./employee.model");

const createEmployeeInDb = async (email, payload) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  if (!user.isShopCreated) {
    throw new Error("You need to create a shop first");
  }
  if (!user.shop) throw new Error("Shop not found");

  //TODO: where check purchase plan how many employees can be added.

  const isExistEmployee = await Employee.findOne({ email: payload.email });
  if (isExistEmployee) {
    throw new Error("Employee is already exists");
  }

  const isExistEmployeeId = await Employee.findOne({
    employeeId: payload.employeeId,
  });
  if (isExistEmployeeId) {
    throw new Error("Employee ID is already exists");
  }

  const newEmployee = await Employee.create({
    ...payload,
    shop: user?.shop._id,
    userId: user._id,
  });

  const result = await Employee.findById(newEmployee._id)
    .populate({ path: "shop", select: "comanyName" })
    .populate({ path: "userId", select: "name email" });

  await User.findByIdAndUpdate(
    user._id,
    {
      $inc: { employeeCount: 1 },
    },
    { new: true }
  );

  return result;
};

const employeeService = {
  createEmployeeInDb,
};
module.exports = employeeService;
