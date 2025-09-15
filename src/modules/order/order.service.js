const { default: mongoose } = require("mongoose");
const AssignedProduct = require("../assignedProduct/assignedProduct.model");
const Employee = require("../employee/employee.model");
const Product = require("../product/product.model");
const Shop = require("../shop/shop.model");
const User = require("../user/user.model");
const Order = require("./order.model");

const orderProduct = async (payload, employeeId, employeeShopId) => {
  console.log({ payload, employeeId, employeeShopId });
  const { productId } = payload;
  // console.log(payload);
  const employee = await Employee.findOne({ employeeId, shop: employeeShopId });
  if (!employee) throw new Error("Employee not found.");

  if (employee.shop.toString() !== payload.shopId) {
    throw new Error("You are not employee under this company.");
  }

  const product = await Product.findById(productId);
  if (!product) throw new Error("Product not found.");

  console.log("product data", product);

  const shop = await Shop.findById(employeeShopId);
  if (!shop) throw new Error("Shop not found.");

  console.log("shop data", shop);

  const haveProduct = await AssignedProduct.findOne({
    productId: product._id,
    shopId: shop._id,
  });
  if (!haveProduct) throw new Error("Product not found in your shop.");

  console.log("my shop product", haveProduct);
  // const shopProduct = shop.products.find((p) =>
  //   p.productId.equals(product._id)
  // );

  // if (!shopProduct) {
  //   throw new Error("Product not found in shop stock.");
  // }

  // if (shopProduct.productQuantity <= 0) {
  //   throw new Error("Product is out of stock.");
  // }

  // if (shop.totalGivenCoin < shopProduct.coin) {
  //   throw new Error("You don't have enough coins.");
  // }

  // const result = await Order.create({
  //   employeeId: employee._id,
  //   productId: product._id,
  //   shopId: shop._id,
  // });

  //? here the problem and some changes is coming........
  // await Shop.findOneAndUpdate(
  //   { _id: shop._id, "products.productId": productId },
  //   {
  //     $inc: {
  //       "products.$.productQuantity": -1,
  //       totalUsedCoin: shopProduct.coin,
  //     },
  //   },
  //   { new: true }
  // );

  // await Employee.findOneAndUpdate(
  //   { employeeId },
  //   { $inc: { coin: -shopProduct.coin } },
  //   { new: true }
  // );

  // return result;
};

const getMyOrders = async (employeeId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const employee = await Employee.findOne({ employeeId });
  if (!employee) throw new Error("Employee not found.");

  const [orders, totalOrders] = await Promise.all([
    Order.find({ employeeId: employee._id })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "employeeId",
        select: "name employeeId",
      })
      .populate({
        path: "productId",
        select: "title price",
      })
      .populate({
        path: "shopId",
        select: "companyName companyId",
      }),
    Order.countDocuments({ employeeId: employee._id }),
  ]);

  const totalPages = Math.ceil(totalOrders / limit);

  return {
    data: orders,
    pagination: {
      totalOrders,
      currentPage: page,
      totalPages,
      limit,
    },
  };
};

const getAllOrdersFromShop = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found.");

  const shop = await Shop.findById(user.shop);
  if (!shop) throw new Error("Shop not found.");

  const result = await Order.find({ shopId: shop._id })
    .populate({
      path: "employeeId",
      select: "name employeeId",
    })
    .populate({
      path: "productId",
      select: "title price",
    })
    .populate({
      path: "shopId",
      select: "companyName companyId",
    });

  return result;
};

const getAllOrders = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find()
      .populate({
        path: "employeeId",
        select: "name employeeId",
      })
      .populate({
        path: "productId",
        select: "title price",
      })
      .populate({
        path: "shopId",
        select: "companyName companyId",
      })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }), // latest first

    Order.countDocuments(),
  ]);

  return {
    orders,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

const placeOrderStatus = async (orderId, payload) => {
  const { status } = payload;

  const result = await Order.findOneAndUpdate(
    { _id: orderId },
    { status },
    {
      new: true,
    }
  );

  return result;
};

const orderService = {
  orderProduct,
  getMyOrders,
  getAllOrdersFromShop,
  getAllOrders,
  placeOrderStatus,
};

module.exports = orderService;
