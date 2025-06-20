const CategoryModel = require("./category.model");
const { sendImageToCloudinary } = require("../../utils/cloudnary");
const User = require("../user/user.model");
const Category = require("./category.model");

exports.createCategory = async (req, res) => {
  try {
    const { email } = req.user;
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({
        status: false,
        message: "Title is required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({
        success: false,
        code: 500,
        message: "Image is required",
      });
    }

    const imageName = `category/${Date.now()}_${file.originalname}`;
    const path = file.path;
    const { secure_url } = await sendImageToCloudinary(imageName, path);

    // First create the category
    const newCategory = await Category.create({
      title,
      thumbnail: secure_url,
      // userId: user._id,
    });

    // Then populate user info
    // const category = await Category.findById(newCategory._id).populate({
    //   path: "userId",
    //   select: "name email",
    // });

    return res.status(201).json({
      success: true,
      code: 201,
      message: "Category created successfully",
      data: newCategory,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      code: 500,
      message: "Error creating category",
      error: error.message,
    });
  }
};

//TODO:1 filter, pagination, search, sort othere is not done, i only check all data is working or not
exports.getAllCategory = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const search = req.query.search || "";
  const sortOrder = req.query.sort || "latest"; // latest, asc, desc

  const filter = {
    $or: [{ blogTitle: { $regex: search, $options: "i" } }],
  };

  let sortBy = { createdAt: -1 }; // Default: latest first

  if (sortOrder === "asc") {
    sortBy = { blogTitle: 1 }; // A–Z
  } else if (sortOrder === "desc") {
    sortBy = { blogTitle: -1 }; // Z–A
  }
  try {
    const categories = await Category.find().skip(skip).limit(limit);
    return res.status(200).json({
      success: true,
      code: 200,
      message: "Categories fetched successfully",
      data: categories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      code: 500,
      message: "Failed to fetch categories",
      error: error.message,
    });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const category = await Category.findById(categoryId);

    return res.status(200).json({
      success: true,
      code: 200,
      message: "Category get successfully",
      data: category,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      code: 500,
      message: "Error fetching category",
      error: error.message,
    });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { title } = req.body;
    const file = req.file;

    const existingCategory = await Category.findById(categoryId);
    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    if (title) {
      existingCategory.title = title;
    }

    if (file) {
      const imageName = `category/${Date.now()}-${file.originalname}`;
      const path = file.path;
      const { secure_url } = await sendImageToCloudinary(imageName, path);
      existingCategory.thumbnail = secure_url;
    }

    await existingCategory.save();

    return res.status(200).json({
      success: true,
      code: 200,
      message: "Category updated successfully",
      data: existingCategory,
    });
  } catch (error) {
    console.error("Update Category Error:", error);
    return res.status(500).json({
      success: false,
      code: 500,
      message: "Failed to update category",
      error: error.message,
    });
  }
};

//TODO:3. Deleted category is not check
exports.deleteCategory = async (req, res) => {
  try {
    const { email: userEmail } = req.user;
    if (!userEmail) {
      return res.status(400).json({
        status: false,
        message: "User not found",
      });
    }
    const id = req.params.id;

    const existingCategory = await CategoryModel.findById(id);
    if (!existingCategory) {
      return res.status(404).json({
        status: false,
        message: "Category not found",
      });
    }

    await existingCategory.remove();
    return res.status(200).json({
      status: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Error deleting category",
      error: error.message,
    });
  }
};
