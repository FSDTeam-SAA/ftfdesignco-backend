const Shop = require("../shop/shop.model");
const User = require("../user/user.model");
const AssignedProduct = require("./assignedProduct.model");

const getAssignedProductForUser = async () => {
  const result = await AssignedProduct.find()
    .populate({
      path: "productId",
      select: "title price quantity category",
      populate: {
        path: "category",
        select: "title",
      },
    })
    .populate({
      path: "userId",
      select: "name email",
    })
    .populate({
      path: "shopId",
      select: "companyName companyId comapnyAddress",
    })
    .exec();

  return result;
};

const getMyShopAssigndedProducts = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  const shop = await Shop.findById(user.shop);
  if (!shop) throw new Error("Shop not found");

  const result = await AssignedProduct.find({ shopId: shop._id })
    .populate({
      path: "productId",
      select: "title price quantity category coin",
      populate: {
        path: "category",
        select: "title",
      },
    })
    .populate({
      path: "shopId",
      select: "companyName companyId",
    })
    .exec();

  return result;
};

const toggleAssigndedProductStatus = async (assignedProductId, payload) => {
  const { status } = payload;

  const result = await AssignedProduct.findById(assignedProductId);
  if (!result) throw new Error("Assigned product not found");

  const updatedProduct = await AssignedProduct.findByIdAndUpdate(
    assignedProductId,
    { status },
    { new: true }
  );

  return updatedProduct;
};

const removeProductFromShop = async (assignedProductId, email) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  const shop = await Shop.findById(user.shop);
  if (!shop) throw new Error("Shop not found");

  const assignedProduct = await AssignedProduct.findById(assignedProductId);
  if (!assignedProduct) throw new Error("Assigned product not found");

  if (
    !assignedProduct.shopId.equals(shop._id) ||
    !assignedProduct.userId.equals(user._id)
  ) {
    throw new Error("You are not authorized to remove this product");
  }

  const result = await AssignedProduct.findByIdAndDelete(assignedProductId);
  return result;
};

const setCoinForProducts = async (email, payload, assignedProductId) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  const shop = await Shop.findById(user.shop);
  if (!shop) throw new Error("Shop not found");

  const assignedProduct = await AssignedProduct.findById(assignedProductId);
  if (!assignedProduct) throw new Error("Assigned product not found");

  if (
    !assignedProduct.shopId.equals(shop._id) ||
    !assignedProduct.userId.equals(user._id)
  ) {
    throw new Error("You are not authorized to remove this product");
  }

  const result = await AssignedProduct.findByIdAndUpdate(
    assignedProductId,
    { coin: payload.coin },
    { new: true }
  );
  return result;
};

const assignedProductService = {
  getAssignedProductForUser,
  getMyShopAssigndedProducts,
  toggleAssigndedProductStatus,
  removeProductFromShop,
  setCoinForProducts,
};

module.exports = assignedProductService;
