const { sendImageToCloudinary } = require("../../utils/cloudnary");
const AssignedProduct = require("../assignedProduct/assignedProduct.model");
const Category = require("../category/category.model");
const Shop = require("../shop/shop.model");
const User = require("../user/user.model");
const Product = require("./product.model");

exports.addProduct = async (req, res) => {
  try {
    const { title, description, price, quantity, category } = req.body;
    if ((!title, !description, !price, !quantity, !category)) {
      return res.status(400).json({
        status: false,
        code: 400,
        message: "All fields are required",
      });
    }

    const isCategoryExists = await Category.findById(category);
    if (!isCategoryExists) {
      return res.status(404).json({
        success: false,
        code: 404,
        message: "Category not found",
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

    const newProduct = await Product.create({
      title,
      description,
      price,
      quantity,
      productImage: secure_url,
      category,
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: newProduct,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      code: 500,
      message: "Product creation failed",
      error: error.message,
    });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const search = req.query.search?.trim() || "";
    const selectedPrices = req.query.prices ? req.query.prices.split(",") : [];
    const sizeFilter = req.query.size ? req.query.size.split(",") : [];
    const categoryTitleFilter = req.query.category
      ? req.query.category.split(",")
      : [];
    const sortBy = req.query.sort || "";

    let filter = {};

    // 🔍 Search filter (title, description, category title)
    if (search) {
      // first find matching category IDs by search
      const categoriesBySearch = await Category.find({
        title: { $regex: search, $options: "i" },
      }).select("_id");

      const matchedCategoryIds = categoriesBySearch.map((c) => c._id);

      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $in: matchedCategoryIds } },
      ];
    }

    // 📏 Size filter
    if (sizeFilter.length > 0) {
      filter.size = { $in: sizeFilter };
    }

    // 🔷 Category filter (by exact title match)
    if (categoryTitleFilter.length > 0) {
      const categories = await Category.find({
        title: { $in: categoryTitleFilter },
      }).select("_id");

      const categoryIds = categories.map((c) => c._id.toString());
      if (categoryIds.length > 0) {
        filter.category = { $in: categoryIds };
      }
    }

    // 💵 Price Range filter
    const isValidRange = (rangeStr) => /^\d+-\d+$/.test(rangeStr);
    const priceConditions = selectedPrices
      .filter(isValidRange)
      .map((rangeStr) => {
        const [min, max] = rangeStr.split("-").map(Number);
        return { price: { $gte: min, $lte: max } };
      });

    if (priceConditions.length > 0) {
      filter.$and = filter.$and || [];
      filter.$and.push({ $or: priceConditions });
    }

    // 📝 Sorting
    let sortQuery = {};
    switch (sortBy) {
      case "asc":
        sortQuery = { title: 1 };
        break;
      case "desc":
        sortQuery = { title: -1 };
        break;
      case "recent":
        sortQuery = { createdAt: -1 };
        break;
      default:
        sortQuery = {};
    }

    // 📄 Query DB
    const [products, totalProducts] = await Promise.all([
      Product.find(filter)
        .skip(skip)
        .limit(limit)
        .sort(sortQuery)
        .populate("category", "title"),
      Product.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalProducts / limit);

    return res.status(200).json({
      success: true,
      code: 200,
      message: "Products retrieved successfully",
      data: products,
      pagination: {
        totalProducts,
        currentPage: page,
        totalPages,
        limit,
      },
    });
  } catch (error) {
    console.error("Get all products error:", error);
    res.status(500).json({
      success: false,
      code: 500,
      message: "Server error",
      error: error.message,
    });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId).populate("category");
    if (!product) {
      return res
        .status(404)
        .json({ success: false, code: 404, message: "Product not found" });
    }

    return res.status(200).json({
      success: true,
      code: 200,
      message: "Product get successfully",
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      code: 500,
      message: "Failed to get product",
      error,
    });
  }
};

exports.updateProductById = async (req, res) => {
  try {
    const { productId } = req.params;
    const { title, description, price, quantity, category } = req.body;
    const file = req.file;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (category) {
      const isCategoryExists = await Category.findById(category);
      if (!isCategoryExists) {
        return res.status(404).json({
          success: false,
          code: 404,
          message: "Category not found",
        });
      }
      product.category = category;
    }

    if (file) {
      const imageName = `category/${Date.now()}_${file.originalname}`;
      const path = file.path;
      const { secure_url } = await sendImageToCloudinary(imageName, path);
      product.productImage = secure_url;
    }

    if (title) product.title = title;
    if (description) product.description = description;
    if (price) product.price = price;
    if (quantity) product.quantity = quantity;

    const updatedProduct = await product.save();

    return res.status(200).json({
      success: true,
      code: 200,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      code: 500,
      message: "Failed to update product",
      error,
    });
  }
};

exports.deleteProductById = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findByIdAndDelete(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, code: 404, message: "Product not found" });
    }

    return res.status(200).json({
      success: true,
      code: 200,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      code: 500,
      message: "Failed to delete product",
      error,
    });
  }
};

exports.addProductToShop = async (req, res) => {
  try {
    const { productId } = req.body;
    const { email } = req.user;

    const user = await User.findOne({ email });
    if (!user) throw new Error("User not found");

    const shop = await Shop.findById(user.shop);
    if (!shop) throw new Error("Shop not found");

    if (shop.status !== "approved") throw new Error("Shop is not approved yet");

    if (shop.userId.toString() !== user._id.toString()) {
      throw new Error("You are not the owner of this shop");
    }

    if (user.isPaid === false) throw new Error("Please buy a subscription");

    // if (!shop.status || shop.status !== "approved") {
    //   throw new Error("Shop is not approved yet");
    // }

    const product = await Product.findById(productId);
    if (!product) throw new Error("Product not found");

    if (product.quantity <= 0) {
      throw new Error("Product is out of stock");
    }

    const isAlreadyExist = await AssignedProduct.findOne({
      productId: product._id,
      userId: user._id,
      shopId: shop._id,
      status: "approved",
    });

    if (isAlreadyExist) {
      throw new Error("Product is already added to your shop");
    }

    const result = await AssignedProduct.create({
      productId: product._id,
      userId: user._id,
      shopId: shop._id,
    });

    return res.status(200).json({
      success: true,
      code: 200,
      message: "Product added to shop successfully",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      code: 400,
      message: error.message,
    });
  }
};
