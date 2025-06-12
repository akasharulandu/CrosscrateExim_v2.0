// models/LoginBackground.js
import mongoose from "mongoose"

const loginBackgroundSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
})

const LoginBackground = mongoose.model("LoginBackground", loginBackgroundSchema)

export default LoginBackground
