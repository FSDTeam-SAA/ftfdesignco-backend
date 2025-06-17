const mongoose = require("mongoose");
const blogSchema = new mongoose.Schema({
    blogTitle: {
        type: String,
        required: true,
        trim: true,
    },
    blogDescription: {
        type: String,
        required: true,
    },
    blogThumbnail: {
        type: String,
        required: true,
    },         
}
, {
    timestamps: true,
});

const BlogModel = mongoose.model("Blog", blogSchema);
module.exports = BlogModel;