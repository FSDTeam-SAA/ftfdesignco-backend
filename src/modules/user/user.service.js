const config = require("../../config");
const sendEmail = require("../../utils/sendEmail");
const verificationCodeTemplate = require("../../utils/verificationCodeTemplate");
const User = require("./user.model");
const bcrypt = require("bcrypt");

const createNewAccountInDB = async (payload) => {
  const existingUser = await User.findOne({ email: payload.email });
  if (existingUser) {
    throw new Error("User already exists");
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = await bcrypt.hash(otp, 10);
  const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

  let result;

  if (existingUser && !existingUser.isVerified) {
    existingUser.otp = hashedOtp;
    existingUser.otpExpires = otpExpires;
    await existingUser.save();
    result = existingUser;
  } else {
    const newUser = new User({
      ...payload,
      otp: hashedOtp,
      otpExpires,
      isVerified: false,
    });
    result = await newUser.save();
  }

  await sendEmail({
    to: result.email,
    subject: "Verify your email",
    html: verificationCodeTemplate(otp),
  });

  const JwtToken = {
    userId: result._id,
    email: result.email,
    role: result.role,
  };
  const accessToken = createToken(
    JwtToken,
    config.JWT_SECRET,
    config.JWT_EXPIRES_IN
  );

  return {
    _id: result._id,
    name: result.name,
    email: result.email,
    role: result.role,
    accessToken,
  };
};

const userService = {
  createNewAccountInDB,
};

module.exports = userService;
