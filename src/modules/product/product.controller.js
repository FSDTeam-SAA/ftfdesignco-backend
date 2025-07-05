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
    console.error("Add product error:", error);
    return res.status(500).json({
      success: false,
      code: 500,
      message: "Product creation failed",
      error: error.message,
    });
  }
};

//TODO:1 there are to much isue i face, i only check can i get all products & limit and other fields i face some isue.Please solved it.
exports.getAllProducts = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filters
    const search = req.query.search || "";
    const selectedPrices = req.query.prices ? req.query.prices.split(",") : [];
    const sizeFilter = req.query.size || "";
    const categoryFilter = req.query.category || "";
    const sortBy = req.query.sort || "";

    const filter = {};

    // Search filter
    if (search) {
      filter.$or = [
        { productName: { $regex: search, $options: "i" } },
        { productDescription: { $regex: search, $options: "i" } },
      ];
    }

    // Size filter
    if (sizeFilter) {
      filter.size = sizeFilter;
    }

    // Category filter
    if (categoryFilter) {
      filter.category = categoryFilter; // Assumes category is stored as ObjectId
    }

    // Price Range filter (multiple ranges supported)
    const isValidRange = (rangeStr) => /^\d+-\d+$/.test(rangeStr);
    const priceConditions = selectedPrices
      .filter(isValidRange)
      .map((rangeStr) => {
        const [min, max] = rangeStr.split("-").map(Number);
        return { price: { $gte: min, $lte: max } };
      });

    if (priceConditions.length > 0) {
      // If `$or` already exists (from search), merge with `$and`
      if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, { $or: priceConditions }];
        delete filter.$or;
      } else {
        filter.$or = priceConditions;
      }
    }

    // Sorting
    let sortQuery = {};
    switch (sortBy) {
      case "asc":
        sortQuery = { productName: 1 };
        break;
      case "desc":
        sortQuery = { productName: -1 };
        break;
      case "recent":
        sortQuery = { createdAt: -1 };
        break;
      default:
        sortQuery = {}; // No sorting
    }

    // Query DB
    const [products, totalProducts] = await Promise.all([
      Product.find(filter)
        .skip(skip)
        .limit(limit)
        .sort(sortQuery)
        .populate("category", "title"),
      Product.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      code: 200,
      message: "Products retrieved successfully",
      data: products,
      totalProducts,
      currentPage: page,
      totalPages: Math.ceil(totalProducts / limit),
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
    console.error("Get product by ID error:", error);
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
    console.error("Update product error:", error);
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
    console.error("Delete product error:", error);
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

    if (user.isPaid === false) throw new Error("Please buy a subscription");

    const shop = await Shop.findById(user.shop);
    if (!shop) throw new Error("Shop not found");

    if (!user.isShopCreated) {
      throw new Error("Shop is not created yet");
    }

    if (!shop.status || shop.status !== "approved") {
      throw new Error("Shop is not approved yet");
    }

    const product = await Product.findById(productId);
    if (!product) throw new Error("Product not found");

    if (product.quantity <= 0) {
      throw new Error("Product is out of stock");
    }

    if (shop.products.find((p) => p.productId.equals(product._id))) {
      throw new Error("Product already added to the shop");
    }

    const updatedShop = await Shop.findByIdAndUpdate(
      shop._id,
      {
        $push: {
          products: { productId, productQuantity: product.quantity },
        },
      },
      { new: true }
    ).populate([
      {
        path: "userId",
        select: "name email shop",
      },
      {
        path: "products.productId",
        populate: {
          path: "category",
          select: "title",
        },
      },
    ]);

    await AssignedProduct.updateOne(
      { productId: productId, userId: user._id },
      { $set: { productId: productId, userId: user._id } },
      { upsert: true }
    );

    return res.status(200).json({
      success: true,
      code: 200,
      message: "Product added to shop successfully",
      data: updatedShop,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      code: 400,
      message: error.message,
    });
  }
};

exports.setCoinForProducts = async (req, res) => {
  try {
    const { userId } = req.user;
    const { productId } = req.params;
    const { coin } = req.body;

    const product = await Product.findById(productId);
    if (!product) throw new Error("Product not found");

    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const shop = await Shop.findOne({
      _id: user.shop,
      "products.productId": product._id,
    });
    if (!shop) throw new Error("Shop not found with this product");

    const updatedShop = await Shop.findOneAndUpdate(
      { _id: user.shop, "products.productId": product._id },
      { $set: { "products.$.coin": coin } },
      { new: true }
    );

    if (!updatedShop) throw new Error("Failed to update coin");

    return res.status(200).json({
      success: true,
      code: 200,
      message: "Product coin updated successfully",
      data: updatedShop,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      code: 400,
      message: error.message,
    });
  }
};
