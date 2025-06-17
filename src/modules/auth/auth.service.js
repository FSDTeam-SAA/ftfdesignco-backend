const config = require("../../config");
const { createToken } = require("../../utils/tokenGenerate");
const User = require("../user/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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

const LoginRefreshToken = async (token) => {
  let decodedToken;

  try {
    decodedToken = jwt.verify(token, config.refreshTokenSecret);

    if (!decodedToken || !decodedToken.email) {
      throw new Error("You are not authorized");
    }
  } catch (error) {
    throw new Error("Unauthorized");
  }

  const email = decodedToken.email;
  const userData = await User.findOne({ email });

  if (!userData) {
    throw new Error("User not found");
  }

  const JwtPayload = {
    userId: userData._id,
    role: userData.role,
    email: userData.email,
  };

  const accessToken = createToken(
    JwtPayload,
    config.JWT_SECRET,
    config.JWT_EXPIRES_IN
  );

  return { accessToken };
};

const authService = {
  loginUser,
  LoginRefreshToken,
};

module.exports = authService;
