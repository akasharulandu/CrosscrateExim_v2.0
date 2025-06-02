// models/Product.js

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  dimensions: { type: [String], default: [] },
  image: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
