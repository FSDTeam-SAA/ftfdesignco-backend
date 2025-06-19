const { sendImageToCloudinary } = require("../../utils/cloudnary");
const Category = require("../category/category.model");
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";
    const selectedPrices = req.query.prices ? req.query.prices.split(",") : [];
    const sizeFilter = req.query.size || "";
    const categoryFilter = req.query.category || "";
    const sortBy = req.query.sort || "";

    const filter = {};

    if (search) {
      filter.$or = [
        { productName: { $regex: search, $options: "i" } },
        { productDescription: { $regex: search, $options: "i" } },
      ];
    }

    if (sizeFilter) {
      filter.size = sizeFilter;
    }

    if (categoryFilter) {
      filter.category = categoryFilter; // expects category _id
    }

    const isValidRange = (rangeStr) => /^\d+-\d+$/.test(rangeStr);
    const priceConditions = selectedPrices
      .filter(isValidRange)
      .map((rangeStr) => {
        const [min, max] = rangeStr.split("-").map(Number);
        return { price: { $gte: min, $lte: max } };
      });

    if (priceConditions.length > 0) {
      filter.$or = filter.$or
        ? [...filter.$or, ...priceConditions]
        : priceConditions;
    }

    let sortQuery = {};
    if (sortBy === "asc") {
      sortQuery = { productName: 1 };
    } else if (sortBy === "desc") {
      sortQuery = { productName: -1 };
    } else if (sortBy === "recent") {
      sortQuery = { createdAt: -1 };
    }

    const products = await Product.find(filter)
      .skip(skip)
      .limit(limit)
      .sort(sortQuery)
      .populate("category", "title");

    const totalProducts = await Product.countDocuments(filter);

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
    const productId = req.params.id;
    const {
      productName,
      productDescription,
      productPrice,
      categoryId,
      subcategory,
      productSize,
    } = req.body;
    const file = req.file; // fix 1: multer er file access

    // Step 1: Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Step 2: Check category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Step 3: Upload image if file exists
    let productImageUrl = product.productImage; // keep existing image if no new file uploaded
    if (file) {
      const imageName = `product/${Date.now()}_${file.originalname}`;
      const path = file.path;
      const { secure_url } = await sendImageToCloudinary(imageName, path);
      productImageUrl = secure_url;
    }

    // Step 4: Update product
    product.title = productName;
    product.description = productDescription;
    product.price = productPrice;
    product.productImage = productImageUrl;
    product.category = {
      _id: category._id,
      name: category.categoryName,
    };
    product.subcategory = subcategory;
    product.productSize = productSize;

    await product.save();

    return res.status(200).json({
      status: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Delete product by ID
exports.deleteProductById = async (req, res) => {
  try {
    const productId = req.params.id;
    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const product = await Product.findByIdAndDelete(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, code: 404, message: "Product not found" });
    }

    return res.status(200).json({
      status: true,
      message: "Product deleted successfully",
      data: product,
    });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
