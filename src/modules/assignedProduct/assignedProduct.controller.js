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


const getMyShopAssigndedProducts = async (req, res) => {
  try {
    const { email } = req.user;

    const {
      categoryName, // filter by category name
      minCoin,
      page = 1,
      limit = 10,
    } = req.query;

    const result = await assignedProductService.getMyShopAssigndedProducts(
      email,
      { categoryName, minCoin, page: parseInt(page), limit: parseInt(limit) }
    );


    return res.status(200).json({
      success: true,
      code: 200,
      message: "Products fetched successfully",
      data: result.products,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, code: 500, message: error.message });
  }
};

const toggleAssigndedProductStatus = async (req, res) => {
  try {
    const { assignedProductId } = req.params;
    const result = await assignedProductService.toggleAssigndedProductStatus(
      assignedProductId,
      req.body
    );

    return res.status(200).json({
      success: true,
      code: 200,
      message: "Product status updated successfully",
      data: result,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, code: 500, message: error.message });
  }
};

const removeProductFromShop = async (req, res) => {
  try {
    const { email } = req.user;
    const { assignedProductId } = req.params;
    const result = await assignedProductService.removeProductFromShop(
      assignedProductId,
      email
    );

    return res.status(200).json({
      success: true,
      code: 200,
      message: "Product removed from shop successfully",
      // data: result,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, code: 500, message: error.message });
  }
};

const setCoinForProducts = async (req, res) => {
  try {
    const { email } = req.user;
    const { assignedProductId } = req.params;
    const result = await assignedProductService.setCoinForProducts(
      email,
      req.body,
      assignedProductId
    );

    return res.status(200).json({
      success: true,
      code: 200,
      message: "Coin set successfully",
      data: result,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, code: 500, message: error.message });
  }
};


const getMyShopApprovedProducts = async (req, res) => {
  try {
    const { email } = req.user;

    // Pass query params to service
    const result = await assignedProductService.getMyShopApprovedProducts(
      email,
      req.query
    );

    return res.status(200).json({
      success: true,
      code: 200,
      message: "Products fetched successfully",
      data: result.data,
      pagination: result.meta, // pagination metadata
    });

  } catch (error) {
    return res
      .status(500)
      .json({ success: false, code: 500, message: error.message });
  }
};


const assignedProductController = {
  getAssignedProducts,
  getMyShopAssigndedProducts,
  toggleAssigndedProductStatus,
  removeProductFromShop,
  setCoinForProducts,
  getMyShopApprovedProducts
};
module.exports = assignedProductController;
