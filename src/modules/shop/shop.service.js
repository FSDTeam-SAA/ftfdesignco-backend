const { sendImageToCloudinary } = require("../../utils/cloudnary");
const AssignedProduct = require("../assignedProduct/assignedProduct.model");
const Employee = require("../employee/employee.model");
const Product = require("../product/product.model");
const User = require("../user/user.model");
const Shop = require("./shop.model");

const crateShopInDb = async (payload, email, files) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  if (!user.isVerified)
    throw new Error("Please verify your email address first");

  if (user.isShopCreated) throw new Error("Shop already created");

  const isShopExist = await Shop.findOne({
    companyId: payload.companyId,
  });
  if (isShopExist) throw new Error("Company ID already exists in the shop");

  const employee = await Employee.findOne({
    email: user.email,
  });
  if (employee) throw new Error("You are already an employee");

  // TODO: After creating a plan, the user can create a shop...[you have to add a field in the user schema for isPayed]

  // Upload logo image
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

  const shop = await Shop.findById(user.shop)
    .populate({
      path: "userId",
      select:
        "-password -otp -otpExpires -resetPasswordOtp -resetPasswordOtpExpires",
    })
    .populate({
      path: "products.productId",
      select: "title price quantity category",
    });

  return shop;
};

const toggleShopStatus = async (payload, shopId) => {
  const shop = await Shop.findById(shopId);
  if (!shop) throw new Error("Shop not found");

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
      "-password -otp -otpExpires -resetPasswordOtp -resetPasswordOtpExpires",
  });

  return result;
};

const getShopDetails = async (shopId) => {
  const shop = await Shop.findById(shopId);
  if (!shop) throw new Error("Shop not found");

  const result = await Shop.findById(shopId).populate({
    path: "userId",
    select:
      "-password -otp -otpExpires -resetPasswordOtp -resetPasswordOtpExpires",
  });
  return result;
};

const getAllShops = async () => {
  const result = await Shop.find().populate({
    path: "userId",
    select: "name email shop isShopCreated isVerified",
  });
  return result;
};

//TODO: there are some logic to be added here and some polishing also add.[ don't change there anything.]............
const addProductToShop = async (productId, coin, email) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  const shop = await Shop.findById(user.shop);
  if (!shop) throw new Error("Shop not found");

  if (!user.isShopCreated) {
    throw new Error("Shop is not created yet");
  }

  if (!shop.status || shop.status !== "approved") {
    throw new Error("Shop is not approved yet");
  }

  const product = await Product.findById(productId);
  if (!product) throw new Error("Product not found");

  const updatedShop = await Shop.findByIdAndUpdate(
    shop._id,
    {
      $push: {
        products: { productId, productQuantity: product.quantity, coin: coin },
      },
    },
    { new: true }
  ).populate([
    {
      path: "userId",
      select: "name email shop",
    },
    {
      path: "products.productId",
      populate: {
        path: "category",
        select: "title",
      },
    },
  ]);

  await AssignedProduct.updateOne(
    { productId: productId, userId: user._id },
    { $set: { productId: productId, userId: user._id } },
    { upsert: true }
  );

  return updatedShop;
};

const shopService = {
  crateShopInDb,
  getShopDetailsByUserId,
  toggleShopStatus,
  getShopDetails,
  getAllShops,
  addProductToShop,
};

module.exports = shopService;
