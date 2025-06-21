const requestProductService = require("./requestProduct.service");

const addRequestProduct = async (req, res) => {
  try {
    const { email } = req.user;
    const result = await requestProductService.addRequestProductIndb(
      req.body,
      email
    );

    res.status(200).json({
      success: true,
      code: 200,
      message: " Product request added successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error adding request product:", error);
    res.status(500).json({
      success: false,
      code: 500,
      message: "Failed to add request product",
      error: error.message,
    });
  }
};

const getAllRequestProducts = async (req, res) => {
  try {
    const result = await requestProductService.getAllRequestProductFromdb();

    res.status(200).json({
      success: true,
      code: 200,
      message: "Request products fetched successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error fetching request products:", error);
    res.status(500).json({
      success: false,
      code: 500,
      message: "Failed to fetch request products",
      error: error.message,
    });
  }
};

const getOwnRequestProducts = async (req, res) => {
  try {
    const { email } = req.user;
    const result = await requestProductService.getOwnRequestProductFromdb(
      email
    );

    res.status(200).json({
      success: true,
      code: 200,
      message: "Your request products get successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error fetching own request products:", error);
    res.status(500).json({
      success: false,
      code: 500,
      message: "Failed to fetch own request products",
      error: error.message,
    });
  }
};

const setRequestProductStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;
    const result = await requestProductService.setRequestProductStatus(
      requestId,
      status
    );

    res.status(200).json({
      success: true,
      code: 200,
      message: "Request product status updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error setting request product status:", error);
    res.status(500).json({
      success: false,
      code: 500,
      message: "Failed to set request product status",
      error: error.message,
    });
  }
};

const requestProductController = {
  addRequestProduct,
  getAllRequestProducts,
  getOwnRequestProducts,
  setRequestProductStatus,
};

module.exports = requestProductController;
