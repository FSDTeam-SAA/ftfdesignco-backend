const User = require("../user/user.model");
const RequestProduct = require("./requestProduct.model");

const addRequestProductIndb = async (payload, email) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  if (!user.isShopCreated) {
    throw new Error("You need to create a shop first");
  }

  const request = await RequestProduct.create({
    ...payload,
    userId: user._id,
  });

  const result = await RequestProduct.findById(request._id)
    .populate("category", "title")
    .populate("userId", "name email");

  return result;
};

const requestProductService = {
  addRequestProductIndb,
};

module.exports = requestProductService;
