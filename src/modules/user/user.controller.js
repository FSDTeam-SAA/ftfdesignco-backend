const userService = require("./user.service");

const createNewAccount = async (req, res) => {
  try {
    const result = await userService.createNewAccountInDB(req.body);

    return res.status(200).json({
      success: true,
      code: 200,
      message: "User created successfully, please verify your email",
      data: result,
    });
  } catch (error) {
    return res
      .status(400)
      .json({ success: false, code: 400, message: error.message });
  }
};

const userController = {
  createNewAccount,
};

module.exports = userController;
