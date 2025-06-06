// // routes/productRoutes.js
// import express from "express"
// import multer from "multer"
// import path from "path"
// import fs from "fs"
// import jwt from "jsonwebtoken"
// import ProductController from "../controllers/productController.js"

// const router = express.Router()

// // JWT auth middleware
// const authMiddleware = (req, res, next) => {
//   const token = req.headers.authorization?.split(" ")[1]
//   if (!token) {
//     return res.status(401).json({ message: "No token provided" })
//   }

//   try {
//     const SECRET = process.env.JWT_SECRET || "supersecretkey"
//     jwt.verify(token, SECRET)
//     console.log("Auth token verified")
//     next()
//   } catch (err) {
//     console.error("Auth error:", err)
//     res.status(403).json({ message: "Invalid or expired token" })
//   }
// }

// // Ensure uploads directory exists
// const uploadDir = path.join(process.cwd(), "uploads")
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true })
//   console.log("Created uploads directory:", uploadDir)
// }

// // Setup Multer for file uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, uploadDir)
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
//     cb(null, uniqueSuffix + path.extname(file.originalname))
//   },
// })

// const upload = multer({
//   storage,
//   limits: {
//     fileSize: 5 * 1024 * 1024, // 5MB limit
//   },
//   fileFilter: (req, file, cb) => {
//     if (file.mimetype.startsWith("image/")) {
//       cb(null, true)
//     } else {
//       cb(new Error("Only image files are allowed!"), false)
//     }
//   },
// })

// // Routes
// router.get("/", ProductController.getAllProducts)
// router.post("/upload", authMiddleware, upload.single("photo"), ProductController.createProduct)
// router.put("/:id", authMiddleware, upload.single("photo"), ProductController.updateProduct)
// router.delete("/:id", authMiddleware, ProductController.deleteProduct)

// export default router



// routes/productRoutes.js
import express from "express"
import multer from "multer"
import path from "path"
import fs from "fs"
import jwt from "jsonwebtoken"
import ProductController from "../controllers/productController.js"

const router = express.Router()

// JWT auth middleware
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]
  if (!token) {
    return res.status(401).json({ message: "No token provided" })
  }

  try {
    const SECRET = process.env.JWT_SECRET || "supersecretkey"
    jwt.verify(token, SECRET)
    console.log("Auth token verified")
    next()
  } catch (err) {
    console.error("Auth error:", err)
    res.status(403).json({ message: "Invalid or expired token" })
  }
}

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), "uploads")
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
  console.log("Created uploads directory:", uploadDir)
}

// Setup Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  },
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

// DEBUG: Test endpoint to check form data parsing
router.post("/test-form", authMiddleware, upload.single("photo"), (req, res) => {
  console.log("=== Test Form Data ===")
  console.log("Body:", req.body)
  console.log("File:", req.file ? req.file.filename : "No file")
  console.log("Body keys:", Object.keys(req.body))

  res.json({
    message: "Form data received",
    body: req.body,
    file: req.file ? req.file.filename : null,
    bodyKeys: Object.keys(req.body),
  })
})

// Routes - Make sure ProductController is imported before using it
router.get("/", ProductController.getAllProducts)
router.post("/upload", authMiddleware, upload.single("photo"), ProductController.createProduct)
router.put("/:id", authMiddleware, upload.single("photo"), ProductController.updateProduct)
router.delete("/:id", authMiddleware, ProductController.deleteProduct)

export default router
