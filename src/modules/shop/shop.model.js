const { Schema, model } = require("mongoose");

const shopModel = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  companyId: {
    type: String,
  },
  companyLogo: {
    type: String,
  },
  comanyBanner: {
    type: String,
  },
});

const Shop = model("Shop", shopModel);
module.exports = Shop;
