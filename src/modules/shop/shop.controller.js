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

const shopController = {
  crateShop,
};

module.exports = shopController;
