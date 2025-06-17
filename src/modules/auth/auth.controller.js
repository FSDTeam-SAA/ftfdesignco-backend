const config = require("../../config");
const authService = require("./auth.service");

const loginUser = async (req, res) => {
  try {
    const result = await authService.loginUser(req.body);

    const { refreshToken, accessToken, user } = result;
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: config.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      data: {
        accessToken,
        user,
      },
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const authController = {
  loginUser,
};

module.exports = authController;
