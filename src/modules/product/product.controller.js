const CategoryModel = require('../category/category.model');
const ProductModel = require('./product.model');
const { sendImageToCloudinary } = require("../../utils/cloudnary");

exports.addProduct = async (req, res) => {
    try {
        const { productName, productDescription, productPrice, categoryId, subcategory, productSize } = req.body;
        const file = req.file; // fix 1: multer er file access

        // Step 1: Check category exists
        const category = await CategoryModel.findById(categoryId);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        // Step 2: Upload image if file exists
        let productImageUrl = "";
        if (file) {
            const imageName = `product/${Date.now()}_${file.originalname}`;
            const path = file.path;
            const { secure_url } = await sendImageToCloudinary(imageName, path);
            productImageUrl = secure_url;
        } else {
            return res.status(400).json({ message: "Product image is required" });
        }

        // Step 3: Create product
        const newProduct = new ProductModel({
            productName,
            productDescription,
            productPrice,
            productImage: productImageUrl,
            productSize,
            category: {
                _id: category._id,
                name: category.categoryName
            },
            subcategory
        });

        await newProduct.save();

        return res.status(201).json({
            status: true,
            message: "Product created successfully",
            data: newProduct
        });
    } catch (error) {
        console.error("Add product error:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

// Get all products with pagination and search
// exports.getAllProducts = async (req, res) => {
//     try{    
    
//         const page = parseInt(req.query.page) || 1;
//         const limit = parseInt(req.query.limit) || 10;
//         const skip = (page - 1) * limit;
//         const search = req.query.search || "";

//         const filter = {
//             $or: [
//                 { productName: { $regex: search, $options: "i" } },
//                 { productDescription: { $regex: search, $options: "i" } }
//             ]
//         };

//         const products = await ProductModel.find(filter)
//             .skip(skip)
//             .limit(limit)
//             .populate('category._id', 'categoryName');

//         const totalProducts = await ProductModel.countDocuments(filter);

//         return res.status(200).json({
//             status: true,
//             message: "Products retrieved successfully",
//             data: products,
//             totalProducts,
//             currentPage: page,
//             totalPages: Math.ceil(totalProducts / limit)
//         });
//     } catch (error) {
//         console.error("Get all products error:", error);
//         res.status(500).json({ message: "Server error", error });
//     }   
// }

exports.getAllProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = req.query.search || "";

        const selectedPrices = req.query.prices ? req.query.prices.split(',') : [];  
        const sizeFilter = req.query.size || "";                                      // e.g., "M"
        const categoryFilter = req.query.category || "";                              // e.g., "Men"
        const sortBy = req.query.sort || "";                                        
        const filter = {
            $and: [
                {
                    $or: [
                        { productName: { $regex: search, $options: "i" } },
                        { productDescription: { $regex: search, $options: "i" } }
                    ]
                }
            ]
        };

        // 🏷️ Filter by Category Name
        if (categoryFilter) {
            filter.$and.push({ "category.categoryName": categoryFilter });
        }

        // 👕 Filter by Size
        if (sizeFilter) {
            filter.$and.push({ size: sizeFilter });
        }

        // 💸 Dynamic Price Range Filter (e.g., 0-100, 101-200)
        const isValidRange = (rangeStr) => /^\d+-\d+$/.test(rangeStr);
        const priceConditions = selectedPrices
            .filter(isValidRange)
            .map(rangeStr => {
                const [min, max] = rangeStr.split('-').map(Number);
                return { price: { $gte: min, $lte: max } };
            });

        if (priceConditions.length > 0) {
            filter.$and.push({ $or: priceConditions });
        }

        let sortQuery = {};
        if (sortBy === "asc") {
            sortQuery = { productName: 1 };
        } else if (sortBy === "desc") {
            sortQuery = { productName: -1 };
        } else if (sortBy === "recent") {
            sortQuery = { createdAt: -1 };
        }

    
        const products = await ProductModel.find(filter)
            .skip(skip)
            .limit(limit)
            .sort(sortQuery)
            .populate('category._id', 'categoryName');

        const totalProducts = await ProductModel.countDocuments(filter);

        return res.status(200).json({
            status: true,
            message: "Products retrieved successfully",
            data: products,
            totalProducts,
            currentPage: page,
            totalPages: Math.ceil(totalProducts / limit)
        });

    } catch (error) {
        console.error("Get all products error:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

// Get product by ID
exports.getProductById = async (req, res) => {
    try {
        const productId = req.params.id;
        if (!productId) {
            return res.status(400).json({ message: "Product ID is required" });
        }

        const product = await ProductModel.findById(productId).populate('category._id', 'categoryName');
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        return res.status(200).json({
            status: true,
            message: "Product retrieved successfully",
            data: product
        });
    } catch (error) {
        console.error("Get product by ID error:", error);
        res.status(500).json({ message: "Server error", error });
    }
};
// Update product by ID
exports.updateProductById = async (req, res) => {
    try {
        const productId = req.params.id;
        const { productName, productDescription, productPrice, categoryId, subcategory, productSize } = req.body;
        const file = req.file; // fix 1: multer er file access

        // Step 1: Check if product exists
        const product = await ProductModel.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Step 2: Check category exists
        const category = await CategoryModel.findById(categoryId);
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
        product.productName = productName;
        product.productDescription = productDescription;
        product.productPrice = productPrice;
        product.productImage = productImageUrl;
        product.category = {
            _id: category._id,
            name: category.categoryName
        };
        product.subcategory = subcategory;
        product.productSize = productSize;

        await product.save();

        return res.status(200).json({
            status: true,
            message: "Product updated successfully",
            data: product
        });
    } catch (error) {
        console.error("Update product error:", error);
        res.status(500).json({ message: "Server error", error });
    }
}

// Delete product by ID
exports.deleteProductById = async (req, res) => {
    try {
        const productId = req.params.id;
        if (!productId) {
            return res.status(400).json({ message: "Product ID is required" });
        }

        const product = await ProductModel.findByIdAndDelete(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        return res.status(200).json({
            status: true,
            message: "Product deleted successfully",
            data: product
        });
    } catch (error) {
        console.error("Delete product error:", error);
        res.status(500).json({ message: "Server error", error });
    }
}