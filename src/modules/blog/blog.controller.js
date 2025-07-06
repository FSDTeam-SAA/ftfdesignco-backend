const BlogModel = require("./blog.model.js");
const { sendImageToCloudinary } = require("../../utils/cloudnary");

exports.createBlog = async (req, res) => {
  try {
    const { blogTitle, blogDescription } = req.body;

    if (!blogTitle || !blogDescription) {
      return res.status(400).json({
        status: false,
        message: "All fields are required",
      });
    }

    const file = req.file;
    if (file) {
      const imageName = `blog/${Date.now()}_${file.originalname}`;
      const path = file?.path;
      const { secure_url } = await sendImageToCloudinary(imageName, path);

      const blog = await BlogModel.create({
        blogTitle,
        blogDescription,
        image: secure_url,
      });

      return res.status(201).json({
        status: true,
        message: "Blog created successfully",
        data: blog,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Error creating blog",
      error: error.message,
    });
  }
};

exports.getAllBlog = async (req, res) => {
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
    const blog = await BlogModel.find(filter)
      .sort(sortBy)
      .skip(skip)
      .limit(limit);

    const totalblog = await BlogModel.countDocuments(filter);
    const totalPages = Math.ceil(totalblog / limit);

    if (blog.length === 0) {
      return res.status(404).json({
        status: false,
        message: "No blog found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Blogs fetched successfully",
      data: blog,
      meta: {
        total: totalblog,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

exports.getSingleBlog = async (req, res) => {
  try {
    const id = req.params.id;
    const blog = await BlogModel.findById(id);
    if (!blog) {
      return res.status(404).json({
        status: false,
        message: "blog not found",
      });
    }
    return res.status(200).json({
      status: true,
      message: "blog fetched successfully",
      data: blog,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Error fetching blog",
      error: error.message,
    });
  }
};

exports.updateBlog = async (req, res) => {
  try {
    const id = req.params.id;
    const { blogTitle, blogDescription } = req.body;

    const existingBlog = await BlogModel.findById(id);
    if (!existingBlog) {
      return res.status(404).json({
        status: false,
        message: "blog not found",
      });
    }

    const file = req.file;
    if (file) {
      const imageName = `blog/${Date.now()}_${file.originalname}`;
      const path = file?.path;
      const { secure_url } = await sendImageToCloudinary(imageName, path);
      existingBlog.image = secure_url;
    }

    const result = await BlogModel.findByIdAndUpdate(id, {
      blogTitle,
      blogDescription,
    });

    return res.status(200).json({
      status: true,
      message: "blog updated successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Error updating blog",
      error: error.message,
    });
  }
};

exports.deleteBlog = async (req, res) => {
  try {
    const id = req.params.id;
    const blog = await BlogModel.findByIdAndDelete(id);
    if (!blog) {
      return res.status(404).json({
        status: false,
        message: "blog not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "blog deleted successfully",
      data: "",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Error deleting blog",
      error: error.message,
    });
  }
};
