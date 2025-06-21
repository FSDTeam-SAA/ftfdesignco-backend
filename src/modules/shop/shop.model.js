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
      //! when final check fixed it.[and search for comapnyName other router  and fixed correctly]
      type: String,
      required: true,
    },
    companyLogo: {
      type: String,
    },
    companyBanner: {
      type: String,
    },
    comapnyAddress: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["approved", "pending", "rejected"],
      default: "pending",
    },
    products: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
        default: [],
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Shop = model("Shop", shopModel);
module.exports = Shop;
