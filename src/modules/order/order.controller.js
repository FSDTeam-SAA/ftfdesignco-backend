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

const orderController = {
  orderProduct,
  getMyOrder,
};

module.exports = orderController;
