const assignedProductService = require("./assignedProduct.service");

const getAssignedProducts = async (req, res) => {
  try {
    const result = await assignedProductService.getAssignedProductForUser();

    return res.status(200).json({
      success: true,
      code: 200,
      message: "Products fetched successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error fetching assigned products:", error);
    return res
      .status(500)
      .json({ success: false, code: 500, message: error.message });
  }
};

const assignedProductController = {
  getAssignedProducts,
};
module.exports = assignedProductController;
