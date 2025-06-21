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

const requestProductController = {
  addRequestProduct,
};

module.exports = requestProductController;
