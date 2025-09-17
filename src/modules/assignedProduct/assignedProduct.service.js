const Employee = require("../employee/employee.model");
const Shop = require("../shop/shop.model");
const User = require("../user/user.model");
const AssignedProduct = require("./assignedProduct.model");

const getAssignedProductForUser = async (employeeId, page = 1, limit = 10) => {
  const employeeData = await Employee.findOne({ employeeId }).populate("shop");
  if (!employeeData) throw new Error("Employee not found.");

  const filter = {
    shopId: employeeData.shop._id,
    status: "approved",
  };

  const skip = (page - 1) * limit;

  const [assignedProducts, total] = await Promise.all([
    AssignedProduct.find(filter)
      .populate("productId")
      .populate({
        path: "shopId",
        select: "companyName companyAddress",
      })
      .skip(skip)
      .limit(limit),
    AssignedProduct.countDocuments(filter),
  ]);

  return {
    data: assignedProducts,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
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

    // Join with product
    {
      $lookup: {
        from: "products",
        localField: "productId",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },

    // Join with category
    {
      $lookup: {
        from: "categories",
        localField: "product.category",
        foreignField: "_id",
        as: "product.category",
      },
    },
    { $unwind: "$product.category" },

    // Optional filter by category name
    ...(categoryName
      ? [
          {
            $match: {
              "product.category.title": { $regex: categoryName, $options: "i" },
            },
          },
        ]
      : []),

    // Join with shop
    {
      $lookup: {
        from: "shops",
        localField: "shopId",
        foreignField: "_id",
        as: "shop",
      },
    },
    { $unwind: "$shop" },

    // ✅ Keep only required fields
    {
      $project: {
        coin: 1,
        status: 1,
        "product._id": 1,
        "product.title": 1,
        "product.price": 1,
        "product.productImage": 1,
        "product.category._id": 1,
        "product.category.title": 1,
        "shop._id": 1,
        "shop.companyName": 1,
        "shop.companyLogo": 1,
      },
    },

    // Pagination + count
    {
      $facet: {
        products: [{ $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: "count" }],
      },
    },
  ];

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

  if (!assignedProduct.status === "approved") {
    throw new Error("Product is not approved yet");
  }

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

const getMyShopApprovedProducts = async (email, query) => {
  const { search, category, minPrice, maxPrice, page = 1, limit = 10 } = query;

  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  const shop = await Shop.findById(user.shop);
  if (!shop) throw new Error("Shop not found");

  // Pagination
  const skip = (Number(page) - 1) * Number(limit);

  // Query AssignedProduct with filters on productId via populate.match
  const products = await AssignedProduct.find({
    shopId: shop._id,
    status: "approved",
  })
    .populate({
      path: "productId",
      match: {
        ...(search && { title: { $regex: search, $options: "i" } }),
        ...(category && { category }),
        ...(minPrice || maxPrice
          ? {
              price: {
                ...(minPrice && { $gte: Number(minPrice) }),
                ...(maxPrice && { $lte: Number(maxPrice) }),
              },
            }
          : {}),
      },
      populate: {
        path: "category",
        model: "Category",
        select: "title thumbnail",
      },
    })
    .populate({
      path: "shopId",
      select: "companyName companyLogo",
    })
    .skip(skip)
    .limit(Number(limit));

  // Filter out items where productId=null (because they didn’t match search/category/price)
  const filteredProducts = products.filter((p) => p.productId);

  // Count again with same filters applied
  const total = filteredProducts.length;

  return {
    data: filteredProducts,
    meta: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

const assignedProductService = {
  getAssignedProductForUser,
  getMyShopAssigndedProducts,
  toggleAssigndedProductStatus,
  removeProductFromShop,
  setCoinForProducts,
  getMyShopApprovedProducts,
};

module.exports = assignedProductService;
