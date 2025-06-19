const { Schema, model } = require("mongoose");

const CategorySchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
    //   unique: true,
    //   trim: true,
    },
    thumbnail: {
      type: String,
      required: [true, "Thumbnail is required"],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    //   required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Category = model("Category", CategorySchema);
module.exports = Category;
