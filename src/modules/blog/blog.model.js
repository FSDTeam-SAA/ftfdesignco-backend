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