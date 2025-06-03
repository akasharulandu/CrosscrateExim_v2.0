// backend/server.js
import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import multer from "multer"
import jwt from "jsonwebtoken"
import path from "path"
import dotenv from "dotenv"
import fs from "fs"
import messageRoutes from "./routes/messageRoutes.js"

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const uploadDir = path.join(process.cwd(), "uploads")
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}
app.use("/uploads", express.static(uploadDir))

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err))

const SECRET = process.env.JWT_SECRET || "supersecretkey"
const ADMIN = { username: "admin", password: "admin123" }

// Updated Product schema with better validation
const ProductSchema = new mongoose.Schema(
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
      min: [0, "Price must be positive"],
      validate: {
        validator: (v) => v > 0,
        message: "Price must be greater than 0",
      },
    },
    imageUrl: { type: String, default: "" },
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
  },
  {
    timestamps: true,
  },
)

const Product = mongoose.model("Product", ProductSchema)

const HeroImage = mongoose.model(
  "HeroImage",
  new mongoose.Schema({
    imageUrl: String,
  }),
)

const LoginBackground = mongoose.model(
  "LoginBackground",
  new mongoose.Schema({
    imageUrl: String,
    uploadedAt: { type: Date, default: Date.now },
  }),
)

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]
  if (!token) return res.status(401).json({ message: "No token provided" })
  try {
    jwt.verify(token, SECRET)
    next()
  } catch (err) {
    res.status(403).json({ message: "Invalid or expired token" })
  }
}

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

app.post("/api/login", (req, res) => {
  const { username, password } = req.body
  if (username === ADMIN.username && password === ADMIN.password) {
    const token = jwt.sign({ user: username }, SECRET, { expiresIn: "1h" })
    return res.json({ success: true, token })
  }
  res.status(401).json({ success: false, message: "Invalid credentials" })
})

app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 })
    res.json(products)
  } catch (err) {
    console.error("Failed to fetch products:", err)
    res.status(500).json({ message: "Failed to fetch products", error: err.message })
  }
})

app.post("/api/products/upload", authMiddleware, upload.single("photo"), async (req, res) => {
  try {
    console.log("=== Product Upload Request ===")
    console.log("Body:", req.body)
    console.log("File:", req.file)

    const { price, specs } = req.body

    // Validate required fields
    if (!req.body["name[en]"] || !req.body["name[en]"].trim()) {
      return res.status(400).json({
        message: "Product name is required",
        error: "Validation failed",
      })
    }

    if (!req.body["description[en]"] || !req.body["description[en]"].trim()) {
      return res.status(400).json({
        message: "Product description is required",
        error: "Validation failed",
      })
    }

    if (!price || isNaN(price) || Number.parseFloat(price) <= 0) {
      return res.status(400).json({
        message: "Valid product price is required",
        error: "Validation failed",
      })
    }

    let imageUrl = ""
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`
    }

    // Parse multilingual fields
    const name = {}
    const description = {}
    Object.keys(req.body).forEach((key) => {
      if (key.startsWith("name[")) {
        const lang = key.match(/\[(.*?)\]/)[1]
        name[lang] = req.body[key].trim()
      }
      if (key.startsWith("description[")) {
        const lang = key.match(/\[(.*?)\]/)[1]
        description[lang] = req.body[key].trim()
      }
    })

    // Parse specs
    let parsedSpecs = []
    if (specs) {
      try {
        parsedSpecs = JSON.parse(specs)
      } catch (err) {
        console.error("Failed to parse specs:", err)
        parsedSpecs = []
      }
    }

    console.log("=== Processed Data ===")
    console.log("Name:", name)
    console.log("Description:", description)
    console.log("Price:", Number.parseFloat(price))
    console.log("ImageUrl:", imageUrl)
    console.log("Specs:", parsedSpecs)

    const productData = {
      name,
      description,
      price: Number.parseFloat(price),
      imageUrl,
      specs: parsedSpecs,
    }

    const newProduct = new Product(productData)

    // Validate before saving
    const validationError = newProduct.validateSync()
    if (validationError) {
      console.error("Validation Error:", validationError)
      return res.status(400).json({
        message: "Validation failed",
        error: validationError.message,
        details: validationError.errors,
      })
    }

    await newProduct.save()
    console.log("✅ Product saved successfully:", newProduct)

    res.status(201).json(newProduct)
  } catch (err) {
    console.error("=== Product upload failed ===")
    console.error("Error message:", err.message)
    console.error("Error stack:", err.stack)

    if (err.name === "ValidationError") {
      console.error("Validation errors:", err.errors)
      return res.status(400).json({
        message: "Validation failed",
        error: err.message,
        details: err.errors,
      })
    }

    if (err.code === 11000) {
      return res.status(400).json({
        message: "Duplicate product",
        error: "Product already exists",
      })
    }

    res.status(500).json({
      message: "Product upload failed",
      error: err.message,
    })
  }
})

app.delete("/api/products/:id", authMiddleware, async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id)
    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" })
    }
    res.json({ success: true, message: "Product deleted successfully" })
  } catch (err) {
    console.error("Failed to delete product:", err)
    res.status(500).json({ message: "Failed to delete product", error: err.message })
  }
})

app.put("/api/products/:id", authMiddleware, upload.single("photo"), async (req, res) => {
  try {
    const { price, specs } = req.body

    // Parse multilingual fields
    const name = {}
    const description = {}
    Object.keys(req.body).forEach((key) => {
      if (key.startsWith("name[")) {
        const lang = key.match(/\[(.*?)\]/)[1]
        name[lang] = req.body[key].trim()
      }
      if (key.startsWith("description[")) {
        const lang = key.match(/\[(.*?)\]/)[1]
        description[lang] = req.body[key].trim()
      }
    })

    const updateData = {
      name,
      description,
      price: Number.parseFloat(price),
      specs: specs ? JSON.parse(specs) : [],
    }

    if (req.file) {
      updateData.imageUrl = `/uploads/${req.file.filename}`
    }

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" })
    }

    res.json(updatedProduct)
  } catch (err) {
    console.error("Failed to update product:", err)

    if (err.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation failed",
        error: err.message,
        details: err.errors,
      })
    }

    res.status(500).json({ message: "Failed to update product", error: err.message })
  }
})

app.get("/api/hero", async (req, res) => {
  try {
    const heroImage = await HeroImage.findOne().sort({ _id: -1 })
    res.json(heroImage || {})
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch hero image" })
  }
})

app.post("/api/hero/upload", authMiddleware, upload.single("photo"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" })
    }

    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
    const newHeroImage = new HeroImage({ imageUrl })
    await newHeroImage.save()
    res.json(newHeroImage)
  } catch (err) {
    console.error("Hero image upload failed:", err)
    res.status(500).json({ message: "Hero image upload failed", error: err.message })
  }
})

app.post("/api/loginbackground/upload", authMiddleware, upload.single("photo"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" })
    }

    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
    const newBackground = new LoginBackground({ imageUrl })
    await newBackground.save()
    res.json(newBackground)
  } catch (err) {
    console.error("Login background upload failed:", err)
    res.status(500).json({ message: "Login background upload failed", error: err.message })
  }
})

app.get("/api/loginbackground", async (req, res) => {
  try {
    const bg = await LoginBackground.findOne().sort({ uploadedAt: -1 })
    res.json(bg || {})
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch login background image" })
  }
})

app.use("/api/messages", messageRoutes)

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Global error handler:", error)

  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "File too large. Maximum size is 5MB." })
    }
  }

  res.status(500).json({ message: "Internal server error", error: error.message })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
