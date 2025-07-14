const cartService = require("./cart.service");

const addToCart = async (req, res) => {
  try {
    const { employeeId } = req.user;
    const result = await cartService.addToCart(employeeId, req.body);

    return res.status(200).json({
      success: true,
      message: "Product added to cart successfully",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getMyOwnCart = async (req, res) => {
  try {
    const { employeeId } = req.user;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await cartService.getMyOwnCart(employeeId, page, limit);

    return res.status(200).json({
      success: true,
      message: "Cart fetched successfully",
      data: result.cart,
      pagination: {
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit),
      },
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { employeeId } = req.user;
    const { cartId } = req.params;
    const result = await cartService.removeFromCart(employeeId, cartId);

    return res.status(200).json({
      success: true,
      message: "Product removed from cart successfully",
      //   data: result,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const cartController = {
  addToCart,
  getMyOwnCart,
  removeFromCart,
};

module.exports = cartController;
