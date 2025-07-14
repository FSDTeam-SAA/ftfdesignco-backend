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

  //   const cartItemKey = `cartData.${productId}`;

  const result = await Employee.findOneAndUpdate(
    { employeeId },
    {
      $set: {
        [`cartData.${productId}`]: {
          productId,
          quantity,
          size,
          coin: assignProduct.coin,
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

  return {
    cart: paginatedCart,
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

const cartService = {
  addToCart,
  getMyOwnCart,
  removeFromCart,
};

module.exports = cartService;
