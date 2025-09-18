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

  if (employee.remainingCoin === 0)
    throw new Error("You don't have enough coin.");

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
      image: product.productImage,
      productId: product._id,
    });

    await Product.findByIdAndUpdate(product._id, {
      $inc: { quantity: -item.quantity },
    });
  }

  const totalCoin = orderItems.reduce((acc, item) => acc + item.totalCoin, 0);

  const order = await Order.create({
    employee: employee._id,
    shop: shop._id,
    items: orderItems,
    status: "pending",
    ...payload,
    totalPayCoin: totalCoin,
  });

  await Employee.findByIdAndUpdate(employee._id, {
    $inc: { remainingCoin: -totalCoin },
  });

  // Clear cart
  employee.cartData = new Map();
  await employee.save();

  return order;
};

const getMyOrders = async (employeeId, page = 1, limit = 10) => {
  const employee = await Employee.findOne({ employeeId });
  if (!employee) throw new Error("Employee not found.");

  page = Math.max(1, parseInt(page));
  limit = Math.max(1, parseInt(limit));

  const totalOrders = await Order.countDocuments({
    employee: employee._id,
    shop: employee.shop,
  });

  const orders = await Order.find({
    employee: employee._id,
    shop: employee.shop,
  })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return {
    data: orders,
    pagination: {
      total: totalOrders,
      page,
      limit,
      totalPages: Math.ceil(totalOrders / limit),
    },
  };
};

const getAllOrdersFromShop = async (email, page = 1, limit = 10) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found.");

  const shop = await Shop.findById(user.shop);
  if (!shop) throw new Error("Shop not found.");

  page = Math.max(1, parseInt(page));
  limit = Math.max(1, parseInt(limit));

  const totalOrders = await Order.countDocuments({ shop: shop._id });

  const orders = await Order.find({ shop: shop._id })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return {
    data: orders,
    pagination: {
      total: totalOrders,
      page,
      limit,
      totalPages: Math.ceil(totalOrders / limit),
    },
  };
};

const getAllOrders = async (page = 1, limit = 10) => {
  page = parseInt(page);
  limit = parseInt(limit);

  const total = await Order.countDocuments();

  const orders = await Order.find()
    .populate("shop", "companyName")
    .skip((page - 1) * limit)
    .limit(limit);

  // Calculate total pages
  const totalPages = Math.ceil(total / limit);

  return {
    orders,
    total,
    page,
    limit,
    totalPages,
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

  if (status === "rejected") {
    await Employee.findByIdAndUpdate(result.employee, {
      $inc: { remainingCoin: result.totalPayCoin },
    });
  } else if (status === "delivered") {
    await Employee.findByIdAndUpdate(result.employee, {
      $inc: { totalOrder: 1 },
    });
  }

  return result;
};

const deletedRejectedOrder = async (orderId) => {
  const order = await Order.findById(orderId);
  if (!order) throw new Error("Order not found.");

  if (order.status !== "rejected") throw new Error("Order is not rejected.");

  const result = await Order.findByIdAndDelete({
    _id: orderId,
    status: "rejected",
  });

  if (!result) throw new Error("Order not found.");
};

const getMyCompanySales = async (
  email,
  page = 1,
  limit = 10,
  searchEmployeeId = null
) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found.");

  const shop = await Shop.findById(user.shop);
  if (!shop) throw new Error("Shop not found.");

  const query = { shop: shop._id, status: "delivered" };

  if (searchEmployeeId) {
    const employee = await Employee.findOne({ employeeId: searchEmployeeId });
    if (!employee) throw new Error("Employee not found.");

    query.employee = employee._id;
  }

  const skip = (page - 1) * limit;
  const [orders, totalOrders] = await Promise.all([
    Order.find(query)
      .populate("employee", "employeeId name email")
      .skip(skip)
      .limit(limit),
    Order.countDocuments(query),
  ]);

  const productSales = {};
  let totalUserCoin = 0;
  let totalProductPrice = 0;

  orders.forEach((order) => {
    totalUserCoin += order.totalPayCoin || 0;

    order.items.forEach((item) => {
      totalProductPrice += (item.price || 0) * (item.quantity || 0);

      if (!productSales[item.title]) {
        productSales[item.title] = {
          productName: item.title,
          quantity: 0,
          coins: 0,
          totalPrice: 0,
          image: item.image || null,
          employees: [],
        };
      }

      productSales[item.title].quantity += item.quantity;
      productSales[item.title].coins += item.totalCoin;
      productSales[item.title].totalPrice +=
        (item.price || 0) * (item.quantity || 0);

      if (order.employee) {
        productSales[item.title].employees.push({
          employeeId: order.employee.employeeId,
          name: order.employee.name,
          email: order.employee.email,
        });
      }
    });
  });

  return {
    pagination: {
      totalOrders,
      currentPage: page,
      totalPages: Math.ceil(totalOrders / limit),
      limit,
    },
    totalProducts: Object.keys(productSales).length,
    totalUserCoin,
    totalProductPrice,
    data: Object.values(productSales),
  };
};

const getSalesSummary = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found.");

  const shop = await Shop.findById(user.shop);
  if (!shop) throw new Error("Shop not found.");

  const orders = await Order.find({ shop: shop._id, status: "delivered" });

  if (orders.length === 0) {
    return res.status(400).json({ success: false, message: "No orders found" });
  }

  const totalProductPrice = orders.reduce(
    (acc, o) =>
      acc + o.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    0
  );

  const paymentSuccess = true;

  if (paymentSuccess) {
    await Order.updateMany(
      { shop: shop._id, status: "delivered" },
      { $set: { status: "paid" } }
    );
  }

  return {
    totalPaid: totalProductPrice,
  };
};

const orderService = {
  orderProduct,
  getMyOrders,
  getAllOrdersFromShop,
  getAllOrders,
  placeOrderStatus,
  deletedRejectedOrder,
  getMyCompanySales,
  getSalesSummary,
};

module.exports = orderService;
