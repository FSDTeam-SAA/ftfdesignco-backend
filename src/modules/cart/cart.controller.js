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
    const result = await cartService.getMyOwnCart(employeeId);

    return res.status(200).json({
      success: true,
      message: "Cart get successfully",
      data: result,
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
