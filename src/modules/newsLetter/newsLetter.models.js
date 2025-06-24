const mongoose = require('mongoose');
const { Schema } = mongoose;

const NewsletterSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

const Newsletters = mongoose.model('Newsletter', NewsletterSchema);

module.exports = { Newsletters };
