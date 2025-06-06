
// backend/server.js
import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import multer from "multer"
import path from "path"
import dotenv from "dotenv"
import fs from "fs"
import { fileURLToPath } from "url"
import jwt from "jsonwebtoken" // Import jwt

// Import routes
import productRoutes from "./routes/productRoutes.js"
import authRoutes from "./routes/authRoutes.js"
import messageRoutes from "./routes/messageRoutes.js"

// Import models
import Product from "./models/Product.js"
import HeroImage from "./models/HeroImage.js"
import LoginBackground from "./models/LoginBackground.js"

// Import middleware
import authMiddleware from "./middleware/auth.js"

// ES6 module compatibility
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Static files
const uploadDir = path.join(process.cwd(), "uploads")
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
  console.log("Created uploads directory:", uploadDir)
}
app.use("/uploads", express.static(uploadDir))

// Database connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err))

// Multer setup for other uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
})

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true)
    } else {
      cb(new Error("Only image files are allowed!"), false)
    }
  },
})

// FIXED: Login route with better error handling
app.post("/api/login", (req, res) => {
  try {
    console.log("=== Login Request Received ===")
    console.log("Request body:", req.body)
    console.log("Content-Type:", req.headers["content-type"])
    console.log("Request method:", req.method)
    console.log("Request URL:", req.url)

    // Direct implementation instead of using controller
    const { username, password } = req.body

    // Check if username and password are provided
    if (!username || !password) {
      console.log("❌ Missing username or password")
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      })
    }

    const ADMIN = { username: "admin", password: "admin123" }
    const SECRET = process.env.JWT_SECRET || "supersecretkey"

    if (username === ADMIN.username && password === ADMIN.password) {
      const token = jwt.sign({ user: username }, SECRET, { expiresIn: "1h" }) // jwt is now declared
      console.log("✅ Login successful - Token generated")
      return res.json({ success: true, token })
    }

    console.log("❌ Login failed - Invalid credentials")
    res.status(401).json({ success: false, message: "Invalid credentials" })
  } catch (error) {
    console.error("Login endpoint error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
})

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/products", productRoutes)
app.use("/api/messages", messageRoutes)

// Hero image routes
app.get("/api/hero", async (req, res) => {
  try {
    const heroImage = await HeroImage.findOne().sort({ uploadedAt: -1 })
    res.json(heroImage || {})
  } catch (err) {
    console.error("Hero image fetch error:", err)
    res.status(500).json({ message: "Failed to fetch hero image" })
  }
})

app.post("/api/hero/upload", authMiddleware, upload.single("photo"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" })
    }

    const imageUrl = `/uploads/${req.file.filename}`
    const newHeroImage = new HeroImage({ imageUrl })
    await newHeroImage.save()

    console.log("✅ Hero image uploaded:", imageUrl)
    res.json(newHeroImage)
  } catch (err) {
    console.error("Hero image upload failed:", err)
    res.status(500).json({ message: "Hero image upload failed", error: err.message })
  }
})

// Login background routes
app.get("/api/loginbackground", async (req, res) => {
  try {
    const bg = await LoginBackground.findOne().sort({ uploadedAt: -1 })
    res.json(bg || {})
  } catch (err) {
    console.error("Login background fetch error:", err)
    res.status(500).json({ message: "Failed to fetch login background image" })
  }
})

app.post("/api/loginbackground/upload", authMiddleware, upload.single("photo"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" })
    }

    const imageUrl = `/uploads/${req.file.filename}`
    const newBackground = new LoginBackground({ imageUrl })
    await newBackground.save()

    console.log("✅ Login background uploaded:", imageUrl)
    res.json(newBackground)
  } catch (err) {
    console.error("Login background upload failed:", err)
    res.status(500).json({ message: "Login background upload failed", error: err.message })
  }
})

// Test and health endpoints
app.get("/api/test", (req, res) => {
  res.json({
    message: "API is working!",
    timestamp: new Date().toISOString(),
    environment: {
      mongoConnected: mongoose.connection.readyState === 1,
      uploadsDir: fs.existsSync(uploadDir),
      nodeEnv: process.env.NODE_ENV || "development",
    },
  })
})

app.get("/api/health", async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected"
    const productCount = await Product.countDocuments()

    res.json({
      status: "healthy",
      database: dbStatus,
      productCount,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    })
  } catch (error) {
    res.status(500).json({
      status: "unhealthy",
      error: error.message,
      timestamp: new Date().toISOString(),
    })
  }
})

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Global error handler:", error)

  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "File too large. Maximum size is 5MB." })
    }
    return res.status(400).json({ message: "File upload error: " + error.message })
  }

  if (error.message === "Only image files are allowed!") {
    return res.status(400).json({ message: "Only image files are allowed!" })
  }

  res.status(500).json({ message: "Internal server error", error: error.message })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📊 Test endpoint: http://localhost:${PORT}/api/test`)
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`)
  console.log(`🔐 Login endpoint: http://localhost:${PORT}/api/login`)
  console.log(`📦 Products API: http://localhost:${PORT}/api/products`)
})
