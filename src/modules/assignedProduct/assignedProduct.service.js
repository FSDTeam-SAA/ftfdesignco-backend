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
      select: "companyName companyId companyAddress",
    })
    .exec();

  return result;
};

const getMyShopAssigndedProducts = async (
  email,
  { categoryName, minCoin, page, limit }
) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  const shop = await Shop.findById(user.shop);
  if (!shop) throw new Error("Shop not found");

  const skip = (page - 1) * limit;

  // Base match
  const matchStage = { shopId: shop._id };

  if (minCoin) {
    matchStage.coin = { $gte: Number(minCoin) };
  }

  const pipeline = [
    { $match: matchStage },
    {
      $lookup: {
        from: "products",
        localField: "productId",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
    {
      $lookup: {
        from: "categories",
        localField: "product.category",
        foreignField: "_id",
        as: "product.category",
      },
    },
    { $unwind: "$product.category" },
  ];

  if (categoryName) {
    pipeline.push({
      $match: {
        "product.category.title": { $regex: categoryName, $options: "i" },
      },
    });
  }

  pipeline.push(
    {
      $lookup: {
        from: "shops",
        localField: "shopId",
        foreignField: "_id",
        as: "shop",
      },
    },
    { $unwind: "$shop" },
    {
      $facet: {
        products: [{ $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: "count" }],
      },
    }
  );

  const result = await AssignedProduct.aggregate(pipeline);

  const products = result[0]?.products || [];
  const total = result[0]?.totalCount[0]?.count || 0;

  return {
    products,
    total,
    page,
    limit,
  };
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
