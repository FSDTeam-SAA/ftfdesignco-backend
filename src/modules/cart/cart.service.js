const { default: mongoose } = require("mongoose");
const AssignedProduct = require("../assignedProduct/assignedProduct.model");
const Employee = require("../employee/employee.model");
const Product = require("../product/product.model");

const addToCart = async (employeeId, payload) => {
  const { productId, quantity, size } = payload;

  const employee = await Employee.findOne({ employeeId });
  if (!employee) throw new Error("Employee not found.");

  if (employee.cartData.has(productId)) {
    throw new Error("Product is already in the cart.");
  }

  const product = await Product.findById(productId);
  if (!product) throw new Error("Product not found.");

  const assignProduct = await AssignedProduct.findOne({
    productId,
    shopId: employee.shop,
  });
  if (!assignProduct) throw new Error("Product not found in your shop.");

  if (product.quantity <= 0) {
    throw new Error("Product is out of stock.");
  }

  if (assignProduct.coin > employee.remainingCoin) {
    throw new Error("You don't have enough coin.");
  }

  const totalCoin = quantity * assignProduct.coin;

  const result = await Employee.findOneAndUpdate(
    { employeeId },
    {
      $set: {
        [`cartData.${productId}`]: {
          productId,
          quantity,
          // size,
          totalCoin,
        },
      },
    },
    { new: true }
  );

  return result;
};

const getMyOwnCart = async (employeeId, page, limit) => {
  const employee = await Employee.findOne({ employeeId }).lean();

  if (!employee) throw new Error("Employee not found.");

  const cartData = employee.cartData || {};
  const cartArray = Object.values(cartData);

  const total = cartArray.length;

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  const paginatedCart = cartArray.slice(startIndex, endIndex);

  // 🔹 Populate product info
  const populatedCart = await Promise.all(
    paginatedCart.map(async (item) => {
      const product = await Product.findById(
        new mongoose.Types.ObjectId(item.productId)
      ).select("title price productImage");

      return {
        ...item,
        product: product ? product.toObject() : null,
      };
    })
  );

  return {
    cart: populatedCart,
    total,
  };
};

const removeFromCart = async (employeeId, cartItemId) => {
  const employee = await Employee.findOne({ employeeId });
  if (!employee) throw new Error("Employee not found.");

  let productIdToRemove = null;

  for (const [productId, cartItem] of employee.cartData.entries()) {
    if (cartItem._id?.toString() === cartItemId) {
      productIdToRemove = productId;
      break;
    }
  }

  if (!productIdToRemove) {
    throw new Error("Product is not in the cart.");
  }

  const result = await Employee.findOneAndUpdate(
    { employeeId },
    {
      $unset: {
        [`cartData.${productIdToRemove}`]: 1,
      },
    },
    { new: true }
  );

  return result;
};

const incrementQuantity = async (cartId, employeeId) => {
  const employee = await Employee.findOne({ employeeId }).lean();
  if (!employee) throw new Error("Employee not found.");

  if (!employee.cartData) {
    throw new Error("Cart is empty.");
  }

  const cartEntry = Object.values(employee.cartData).find(
    (item) => item._id?.toString() === cartId.toString()
  );

  if (!cartEntry) {
    throw new Error("Cart item not found.");
  }

  const product = await Product.findById(cartEntry.productId);
  if (!product) {
    throw new Error("Product not found.");
  }

  if (cartEntry.quantity >= product.quantity) {
    throw new Error("Not enough stock available to increase quantity.");
  }

  const newQuantity = cartEntry.quantity + 1;
  const newTotalCoin = newQuantity * product.price;

  const result = await Employee.findOneAndUpdate(
    { employeeId },
    {
      $set: {
        [`cartData.${cartEntry.productId.toString()}.quantity`]: newQuantity,
        [`cartData.${cartEntry.productId.toString()}.totalCoin`]: newTotalCoin,
      },
    },
    { new: true }
  ).lean();

  return result;
};

const decrementQuantity = async (cartId, employeeId) => {
  const employee = await Employee.findOne({ employeeId }).lean();
  if (!employee) throw new Error("Employee not found.");

  if (!employee.cartData) {
    throw new Error("Cart is empty.");
  }

  const cartEntry = Object.values(employee.cartData).find(
    (item) => item._id?.toString() === cartId.toString()
  );

  if (!cartEntry) {
    throw new Error("Cart item not found.");
  }

  const product = await Product.findById(cartEntry.productId);
  if (!product) {
    throw new Error("Product not found.");
  }

  if (cartEntry.quantity <= 1) {
    throw new Error("Quantity cannot be less than 1.");
  }

  const newQuantity = cartEntry.quantity - 1;
  const newTotalCoin = newQuantity * product.price;

  const updatedEmployee = await Employee.findOneAndUpdate(
    { employeeId },
    {
      $set: {
        [`cartData.${cartEntry.productId.toString()}.quantity`]: newQuantity,
        [`cartData.${cartEntry.productId.toString()}.totalCoin`]: newTotalCoin,
      },
    },
    { new: true }
  ).lean();

  return updatedEmployee;
};

const cartService = {
  addToCart,
  getMyOwnCart,
  removeFromCart,
  incrementQuantity,
  decrementQuantity,
};

module.exports = cartService;
