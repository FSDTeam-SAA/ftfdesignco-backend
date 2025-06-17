const mongoose = require('mongoose');
const CategorySchema = new mongoose.Schema({
    categoryName:{
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    categoryThumbnail: {
        type: String,
        required: true,
        trim: true
    },},{
        timestamps:true
    
    });