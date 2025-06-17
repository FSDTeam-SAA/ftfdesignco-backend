const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    productDescription: {
        type: String,
        required: true,
        trim: true
    },
    productPrice: {
        type: Number,
        required: true,
        min: 0
    },
    productImage: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true
        },
        name: {
            type: String,
            required: true
        }
    },
    subcategory: {
        type: String,
        required: false // optional, unless you want to enforce subcategory selection
    },
    productSize: {
        type: String,
        required: false // optional, unless you want to enforce size selection
    },
}, {
    timestamps: true
});

const ProductModel = mongoose.model('Product', ProductSchema);
module.exports = ProductModel;
