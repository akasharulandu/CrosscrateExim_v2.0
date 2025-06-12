// models/Product.js
import mongoose from "mongoose"

const productSchema = new mongoose.Schema(
  {
    name: {
      en: { type: String, required: true, trim: true, minlength: 2 },
      ta: { type: String, trim: true },
      hi: { type: String, trim: true },
      ml: { type: String, trim: true },
    },
    description: {
      en: { type: String, required: true, trim: true, minlength: 10 },
      ta: { type: String, trim: true },
      hi: { type: String, trim: true },
      ml: { type: String, trim: true },
    },
    price: {
      type: Number,
      required: true,
      min: [0.01, "Price must be greater than 0"],
    },
    imageUrl: {
      type: String,
      default: "",
    },
    specs: [
      {
        label: {
          en: { type: String, required: true, trim: true },
          ta: { type: String, trim: true },
          hi: { type: String, trim: true },
          ml: { type: String, trim: true },
        },
        value: {
          en: { type: String, required: true, trim: true },
          ta: { type: String, trim: true },
          hi: { type: String, trim: true },
          ml: { type: String, trim: true },
        },
      },
    ],
    // Legacy support
    dimensions: { type: [String], default: [] },
  },
  {
    timestamps: true,
  },
)

const Product = mongoose.model("Product", productSchema)

export default Product
