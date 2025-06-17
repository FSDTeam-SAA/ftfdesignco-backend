const CategoryModel = require("./category.model");
const { sendImageToCloudinary } = require("../../utils/cloudnary");


//------------------------- Category -------------------------

// Create a new category

exports.createCategory = async (req, res) => {
    try {
        const { email: userEmail } = req.user;
        if (!userEmail) {
            return res.status(400).json({
                status: false,
                message: "User not found",
            });
        }
        const { categoryName, } = req.body;

        if (!categoryName) {
            return res.status(400).json({
                status: false,
                message: "All fields are required",
            });
        }

        const file = req.file;
        if (file) {
            const imageName = `category/${Date.now()}_${file.originalname}`;
            const path = file?.path;
            const { secure_url } = await sendImageToCloudinary(imageName, path);

            const category = new BlogModel({
                categoryName,
                imageLink: secure_url,
            });
            await category.save();

            return res.status(201).json({
                status: true,
                message: "Category created successfully",
                data: blog,
            });
        }
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Error creating category",
            error: error.message,
        });
    }
}


//get all categories
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
        const categories = await CategoryModel.find();
        return res.status(200).json({
            status: true,
            message: "Categories fetched successfully",
            data: categories,
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Error fetching categories",
            error: error.message,
        });
    }
}


// Get a single category by ID

exports.getCategoryById = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id) {
            return res.status(400).json({
                status: false,
                message: "Category ID is required",
            });
        }

        const category = await CategoryModel.findById(id);
        if (!category) {
            return res.status(404).json({
                status: false,
                message: "Category not found",
            });
        }

        return res.status(200).json({
            status: true,
            message: "Category fetched successfully",
            data: category,
        }
        );
    }
    catch (error) {
        return res.status(500).json({
            status: false,
            message: "Error fetching category",
            error: error.message,
        });



    }
};

// Update a category by ID

exports.updateCategory = async (req, res) => {

    try {
        const { email: userEmail } = req.user;
        if (!userEmail) {
            return res.status(400).json({
                status: false,
                message: "User not found",
            });
        }
        const id = req.params.id;
        const { categoryName } = req.body;

        const existingCategory = await CategoryModel.findById(id);
        if (!existingCategory) {
            return res.status(404).json({
                status: false,
                message: "Category not found",
            });
        }
        const file = req.file;
        if (file) {
            const imageName = `category/${Date.now()}_${file.originalname}`;
            const path = file?.path;
            const { secure_url } = await sendImageToCloudinary(imageName, path);

            existingCategory.categoryThumbnail = secure_url;
        }
        // Update the category item
        existingCategory.categoryName = categoryName;
        await existingCategory.save();
        return res.status(200).json({
            status: true,
            message: "Category updated successfully",
            data: existingCategory,
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Error updating category",
            error: error.message,
        });
    }
};

// Delete a category by ID

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
}       
//_______________________________________end_____________________________