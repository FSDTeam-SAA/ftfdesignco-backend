const { default: mongoose } = require("mongoose");
const AssignedProduct = require("../assignedProduct/assignedProduct.model");
const Employee = require("../employee/employee.model");
const Product = require("../product/product.model");
const Shop = require("../shop/shop.model");
const User = require("../user/user.model");
const Order = require("./order.model");

const orderProduct = async (employeeId, employeeShopId, payload) => {
  const employee = await Employee.findOne({ employeeId });
  if (!employee) throw new Error("Employee not found.");

  const shop = await Shop.findById(employeeShopId);
  if (!shop) throw new Error("Shop not found.");

  // ✅ Map থেকে value নেওয়া হচ্ছে
  const cartItems = Array.from(employee.cartData?.values() || []);

  if (!cartItems.length) throw new Error("Cart is empty.");

  const orderItems = [];

  for (const item of cartItems) {
    const productId =
      item.productId?._id || item.productId?.toString?.() || item.productId;
    if (!productId) {
      throw new Error("Invalid productId in cart item.");
    }

    const product = await Product.findById(productId);
    if (!product) throw new Error(`Product not found: ${productId}`);

    if (item.quantity > product.quantity) {
      throw new Error(`Not enough stock for product: ${product.title}.`);
    }

    orderItems.push({
      productId: product._id,
      title: product.title,
      price: product.price,
      quantity: item.quantity,
      totalCoin: item.totalCoin,
    });

    await Product.findByIdAndUpdate(product._id, {
      $inc: { quantity: -item.quantity },
    });
  }

  const order = await Order.create({
    employee: employee._id,
    shop: shop._id,
    items: orderItems,
    status: "pending",
    ...payload,
    totalPayCoin: orderItems.reduce((acc, item) => acc + item.totalCoin, 0),
  });

  // Clear cart
  employee.cartData = new Map();
  await employee.save();

  return order;
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
