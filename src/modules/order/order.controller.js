const orderService = require("./order.service");

const orderProduct = async (req, res) => {
  try {
    const { employeeId } = req.user;
    const result = await orderService.orderProduct(req.body, employeeId);

    return res.status(200).json({
      success: true,
      code: 200,
      message: "Product ordered successfully",
      data: result,
    });
  } catch (error) {
    return res
      .status(400)
      .json({ success: false, code: 400, message: error.message });
  }
};

const getMyOrder = async (req, res) => {
  try {
    const { employeeId } = req.user;
    const result = await orderService.getMyOrders(employeeId);

    return res.status(200).json({
      success: true,
      code: 200,
      message: "Orders fetched successfully",
      data: result,
    });
  } catch (error) {
    return res
      .status(400)
      .json({ success: false, code: 400, message: error.message });
  }
};

const getAllOrdersFromShop = async (req, res) => {
  try {
    const { email } = req.user;
    const result = await orderService.getAllOrdersFromShop(email);

    return res.status(200).json({
      success: true,
      code: 200,
      message: "Orders fetched successfully",
      data: result,
    });
  } catch (error) {
    return res
      .status(400)
      .json({ success: false, code: 400, message: error.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const result = await orderService.getAllOrders();

    return res.status(200).json({
      success: true,
      code: 200,
      message: "Orders fetched successfully",
      data: result,
    });
  } catch (error) {
    return res
      .status(400)
      .json({ success: false, code: 400, message: error.message });
  }
};

const placeOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const result = await orderService.placeOrderStatus(orderId, req.body);

    return res.status(200).json({
      success: true,
      code: 200,
      message: "Order status updated successfully",
      data: result,
    });
  } catch (error) {
    return res
      .status(400)
      .json({ success: false, code: 400, message: error.message });
  }
};

const orderController = {
  orderProduct,
  getMyOrder,
  getAllOrdersFromShop,
  getAllOrders,
  placeOrderStatus,
};

module.exports = orderController;
