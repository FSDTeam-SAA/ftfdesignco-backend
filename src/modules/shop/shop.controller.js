const shopService = require("./shop.service");

const crateShop = async (req, res) => {
  try {
    const { email } = req.user;
    const result = await shopService.crateShopInDb(req.body, email, req.files);

    return res.status(200).json({
      success: true,
      code: 200,
      message: "Shop created successfully",
      data: result,
    });
  } catch (error) {
    return res
      .status(400)
      .json({ success: false, code: 400, message: error.message });
  }
};

const getShopDetails = async (req, res) => {
  try {
    const { email } = req.user;
    const result = await shopService.getShopDetailsByUserId(email);

    return res.status(200).json({
      success: true,
      code: 200,
      message: "Shop get successfully",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      code: 400,
      message: "Failed to get shop",
      error: error.message,
    });
  }
};

const toggleShopStatus = async (req, res) => {
  try {
    const { shopId } = req.params;
    const result = await shopService.toggleShopStatus(req.body, shopId);

    return res.status(200).json({
      success: true,
      code: 200,
      message: "Shop status updated successfully",
      data: result,
    });
  } catch (error) {
    return res
      .status(400)
      .json({ success: false, code: 400, message: error.message });
  }
};

const shopDetails = async (req, res) => {
  try {
    const { shopId } = req.params;
    const result = await shopService.getShopDetails(shopId);

    return res.status(200).json({
      success: true,
      code: 200,
      message: "Shop details fetched successfully",
      data: result,
    });
  } catch (error) {
    return res
      .status(400)
      .json({ success: false, code: 400, message: error.message });
  }
};

const getAllShops = async (req, res) => {
  try {
    const result = await shopService.getAllShops();

    return res.status(200).json({
      success: true,
      code: 200,
      message: "Shops fetched successfully",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      code: 400,
      message: "Failed to get shops",
      error: error.message,
    });
  }
};

const addProductInShop = async (req, res) => {
  try {
    const { productId, coin } = req.body;
    const { email } = req.user;

    const result = await shopService.addProductToShop(productId, coin, email);

    return res.status(200).json({
      success: true,
      code: 200,
      message: "Product added to shop successfully",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      code: 400,
      message: error.message,
    });
  }
};

const shopController = {
  crateShop,
  getShopDetails,
  toggleShopStatus,
  shopDetails,
  getAllShops,
  addProductInShop,
};

module.exports = shopController;
