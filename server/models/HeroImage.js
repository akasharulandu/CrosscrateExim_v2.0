// models/HeroImage.js
import mongoose from "mongoose"

const heroImageSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
})

const HeroImage = mongoose.model("HeroImage", heroImageSchema)

export default HeroImage
