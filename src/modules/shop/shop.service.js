const { sendImageToCloudinary } = require("../../utils/cloudnary");
const Employee = require("../employee/employee.model");
const User = require("../user/user.model");
const Shop = require("./shop.model");

const crateShopInDb = async (payload, email, files) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  if (!user.isVerified)
    throw new Error("Please verify your email address first");

  if (user.isShopCreated) throw new Error("Shop already created");
  // if (user.isPaid === false) throw new Error("Please buy a subscription");

  const isShopExist = await Shop.findOne({
    companyId: payload.companyId,
  });
  if (isShopExist) throw new Error("Company ID already exists in the shop");

  const employee = await Employee.findOne({
    email: user.email,
  });
  if (employee) throw new Error("You are already an employee");


  if (files?.companyLogo?.[0]) {
    const logoImage = files.companyLogo[0];
    const imageName = `${Date.now()}-${logoImage.originalname}`;
    const { secure_url } = await sendImageToCloudinary(
      imageName,
      logoImage.path
    );
    payload.companyLogo = secure_url;
  }

  if (files?.companyBanner?.[0]) {
    const bannerImage = files.companyBanner[0];
    const imageName = `${Date.now()}-${bannerImage.originalname}`;
    const { secure_url } = await sendImageToCloudinary(
      imageName,
      bannerImage.path
    );
    payload.companyBanner = secure_url;
  }

  const result = await Shop.create({
    ...payload,
    userId: user._id,
  });

  await User.findOneAndUpdate(
    { email },
    { $set: { isShopCreated: true, shop: result._id } },
    {
      new: true,
      projection:
        "-password -otp -otpExpires -resetPasswordOtp -resetPasswordOtpExpires",
    }
  );

  return result;
};

const getShopDetailsByUserId = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  if (!user.isShopCreated) throw new Error("Shop is not created yet");
  if (!user.shop) throw new Error("Shop not found");

  const shop = await Shop.findById(user.shop).populate({
    path: "userId",
    select:
      "-password -otp -otpExpires -resetPasswordOtp -resetPasswordOtpExpires",
  });

  return shop;
};

const toggleShopStatus = async (payload, shopId) => {
  const shop = await Shop.findById(shopId);
  if (!shop) throw new Error("Shop not found");

  const user = await User.findById(shop.userId);
  if (!user) throw new Error("User not found");

  const allowedStatuses = ["approved", "pending", "rejected"];

  if (!payload.status || !allowedStatuses.includes(payload.status)) {
    throw new Error("Invalid status. Allowed: approved, pending, rejected.");
  }

  const result = await Shop.findOneAndUpdate(
    { _id: shopId },
    { status: payload.status },
    { new: true }
  ).populate({
    path: "userId",
    select:
      "name email phone employeeCount isPaid",
  });

  await User.findOneAndUpdate(
    { email: user.email },
    { $set: { role: "company_admin" } },
    {
      new: true,
    }
  );

  return result;
};

const getShopDetails = async (shopId) => {
  const shop = await Shop.findById(shopId);
  if (!shop) throw new Error("Shop not found");

  const result = await Shop.findById(shopId).populate({
    path: "userId",
    select:
      "-password -otp -otpExpires -resetPasswordOtp -resetPasswordOtpExpires -createdAt -updatedAt",
  });
  return result;
};

const getAllShops = async (page, limit) => {
  const skip = (page - 1) * limit;

  const [shops, total] = await Promise.all([
    Shop.find()
      .populate({
        path: "userId",
        select: "name email shop isShopCreated isVerified",
      })
      .skip(skip)
      .limit(limit),
    Shop.countDocuments(),
  ]);

  return { shops, total };
};

const shopService = {
  crateShopInDb,
  getShopDetailsByUserId,
  toggleShopStatus,
  getShopDetails,
  getAllShops,
};

module.exports = shopService;
