const config = require("../../config");
const { createToken } = require("../../utils/tokenGenerate");
const User = require("../user/user.model");
const bcrypt = require("bcrypt");

const loginUser = async (payload) => {
  const isExistingUser = await User.findOne({
    email: payload.email,
  }).select("+password");

  if (!isExistingUser) {
    throw new Error("User not found");
  }

  if (!isExistingUser.isVerified) {
    throw new Error("Please verify your email");
  }

  // console.log("Plain password:", payload.password);
  // console.log("Hashed password in DB:", isExistingUser.password);

  const isPasswordMatched = await bcrypt.compare(
    payload.password,
    isExistingUser.password
  );

  if (!isPasswordMatched) {
    throw new Error("Invalid password");
  }

  const userObj = isExistingUser.toObject();
  delete userObj.password;
  delete userObj.otp;
  delete userObj.otpExpires;

  const JwtToken = {
    userId: isExistingUser._id,
    email: isExistingUser.email,
    role: isExistingUser.role,
  };

  const accessToken = createToken(
    JwtToken,
    config.JWT_SECRET,
    config.JWT_EXPIRES_IN
  );

  const refreshToken = createToken(
    JwtToken,
    config.refreshTokenSecret,
    config.jwtRefreshTokenExpiresIn
  );

  return {
    accessToken,
    user: userObj,
    refreshToken,
  };
};

const authService = {
  loginUser,
};

module.exports = authService;
