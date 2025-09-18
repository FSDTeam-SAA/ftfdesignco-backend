const orderService = require("./order.service");

const orderProduct = async (req, res) => {
  try {
    const { employeeId, shop } = req.user;
    const result = await orderService.orderProduct(employeeId, shop, req.body);

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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await orderService.getMyOrders(employeeId, page, limit);

    return res.status(200).json({
      success: true,
      code: 200,
      message: "Orders fetched successfully",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("getMyOrder error:", error);
    return res.status(400).json({
      success: false,
      code: 400,
      message: error.message,
    });
  }
};

module.exports = { getMyOrder };

const getAllOrdersFromShop = async (req, res) => {
  try {
    const { email } = req.user;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await orderService.getAllOrdersFromShop(email, page, limit);

    return res.status(200).json({
      success: true,
      code: 200,
      message: "Orders fetched successfully",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      code: 500,
      message: error.message || "Something went wrong",
    });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await orderService.getAllOrders(page, limit);

    return res.status(200).json({
      success: true,
      code: 200,
      message: "Orders fetched successfully",
      data: result.orders,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
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

const deletedRejectedOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    await orderService.deletedRejectedOrder(orderId);

    return res.status(200).json({
      success: true,
      code: 200,
      message: "Order deleted successfully",
    });
  } catch (error) {
    return res
      .status(400)
      .json({ success: false, code: 400, message: error.message });
  }
};

const getMyCompanySales = async (req, res) => {
  try {
    const { email } = req.user;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const searchEmployeeId = req.query.employeeId || null;

    const result = await orderService.getMyCompanySales(
      email,
      page,
      limit,
      searchEmployeeId
    );

    return res.status(200).json({
      success: true,
      code: 200,
      message: "Company sales fetched successfully",
      ...result,
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
  deletedRejectedOrder,
  getMyCompanySales,
};

module.exports = orderController;
