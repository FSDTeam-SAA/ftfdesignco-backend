const AssignedProduct = require("./assignedProduct.model");

const getAssignedProductForUser = async () => {
  const result = await AssignedProduct.find()
    .populate({
      path: "productId",
      select: "title price quantity category",
      populate: {
        path: "category",
        select: "title",
      },
    })
    .populate({
      path: "userId",
      select: "name email shop",
      populate: {
        path: "shop",
        select: "companyName",
      },
    })
    .exec();

  return result;
};
  

const assignedProductService = {
  getAssignedProductForUser,
};

module.exports = assignedProductService;
