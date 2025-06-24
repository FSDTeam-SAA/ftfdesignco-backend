const User = require("../user/user.model");
const RequestProduct = require("./requestProduct.model");

const addRequestProductIndb = async (payload, email) => {
  const user = await User.findOne({ email }).populate("shop", "companyName");
  if (!user) throw new Error("User not found");

  if (!user.isShopCreated) {
    throw new Error("You need to create a shop first");
  }

  if (!user.shop) throw new Error("Shop not found for this user");

  const request = await RequestProduct.create({
    ...payload,
    userId: user._id,
  });

  const result = await RequestProduct.findById(request._id)
    .populate("category", "title")
    .populate({
      path: "userId",
      select: "name email shop",
      populate: {
        path: "shop",
        select: "companyName",
      },
    });

  return result;
};

const getAllRequestProductFromdb = async () => {
  const result = await RequestProduct.find()
    .populate("category", "title")
    .populate({
      path: "userId",
      select: "name email shop",
      populate: {
        path: "shop",
        select: "companyName",
      },
    });

  return result;
};

const getOwnRequestProductFromdb = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  const result = await RequestProduct.find({ userId: user._id })
    .populate("category", "title")
    .populate({
      path: "userId",
      select: "name email shop",
      populate: {
        path: "shop",
        select: "companyName",
      },
    });

  return result;
};

const setRequestProductStatus = async (requestId, status) => {
  const request = await RequestProduct.findById(requestId);
  if (!request) throw new Error("Request not found");

  if (!["approved", "rejected"].includes(status)) {
    throw new Error("Invalid status");
  }

  const result = await RequestProduct.findByIdAndUpdate(
    requestId,
    { status },
    { new: true }
  );

  return result;
};

const requestProductService = {
  addRequestProductIndb,
  getAllRequestProductFromdb,
  getOwnRequestProductFromdb,
  setRequestProductStatus,
};

module.exports = requestProductService;
