const { Schema, model } = require("mongoose");

const shopModel = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      //   required: true,
    },
    companyId: {
      type: String,
      required: true,
    },
    comanyName: {
      type: String,
      required: true,
    },
    companyLogo: {
      type: String,
      // required: true,
    },
    companyBanner: {
      type: String,
      // required: true,
    },
    comapnyAddress: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Shop = model("Shop", shopModel);
module.exports = Shop;
