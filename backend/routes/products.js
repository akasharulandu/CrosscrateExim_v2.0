const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: Number,
  imageUrl: String,
  dimensions: [
    {
      length: Number,
      width: Number,
      height: Number,
    }
  ],
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
