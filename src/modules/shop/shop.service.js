const { sendImageToCloudinary } = require("../../utils/cloudnary");
const Product = require("../product/product.model");
const User = require("../user/user.model");
const Shop = require("./shop.model");

const crateShopInDb = async (payload, email, files) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  if (user.isShopCreated) throw new Error("Shop already created");
  if (!user.isVerified)
    throw new Error("Please verify your email address first");

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

const addProductToShop = async (productId, email) => {
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

  if (product.quantity <= 0) {
    throw new Error("Product is out of stock");
  }

  const updatedShop = await Shop.findByIdAndUpdate(
    shop._id,
    { $push: { products: productId } },
    { new: true }
  ).populate([
    {
      path: "userId",
      select: "name email shop",
    },
    {
      path: "products",
      populate: {
        path: "category",
        select: "title",
      },
    },
  ]);

  await Product.findByIdAndUpdate(
    productId,
    { $inc: { quantity: -1 } },
    { new: true }
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
