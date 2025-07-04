const Employee = require("../employee/employee.model");
const Product = require("../product/product.model");
const Shop = require("../shop/shop.model");
const User = require("../user/user.model");
const Order = require("./order.model");

//There are some logic problem in this function.... i cann't add logic employee is under vaild shop or not and product is under valid shop or not.
const orderProduct = async (payload, employeeId) => {
  const { productId, shopId } = payload;

  const employee = await Employee.findOne({ employeeId });
  if (!employee) throw new Error("Employee not found.");

  if (employee.shop !== shopId) {
    throw new Error("You are not employee under this company.");
  }

  const product = await Product.findById(productId);
  if (!product) throw new Error("Product not found.");

  const shop = await Shop.findById(shopId);
  if (!shop) throw new Error("Shop not found.");

  const shopProduct = shop.products.find((p) =>
    p.productId.equals(product._id)
  );

  if (!shopProduct) {
    throw new Error("Product not found in shop stock.");
  }

  if (shopProduct.productQuantity <= 0) {
    throw new Error("Product is out of stock.");
  }

  if (shop.totalGivenCoin < shopProduct.coin) {
    throw new Error("You don't have enough coins.");
  }

  if (shopProduct._id !== product._id) {
    throw new Error("Product not found in shop stock.");
  }

  const result = await Order.create({
    employeeId: employee._id,
    productId: product._id,
    shopId: shop._id,
  });

  await Shop.findOneAndUpdate(
    { _id: shopId, "products.productId": productId },
    {
      $inc: {
        "products.$.productQuantity": -1,
        totalUsedCoin: shopProduct.coin,
      },
    },
    { new: true }
  );

  await Employee.findOneAndUpdate(
    { employeeId },
    { $inc: { coin: -shopProduct.coin } },
    { new: true }
  );

  return result;
};

const getMyOrders = async (employeeId) => {
  const employee = await Employee.findOne({ employeeId });
  if (!employee) throw new Error("Employee not found.");

  const result = await Order.find({ employeeId: employee._id })
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

const getAllOrders = async () => {
  const result = await Order.find()
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
