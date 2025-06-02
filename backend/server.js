// backend/server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import multer from "multer";
import jwt from "jsonwebtoken";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import messageRoutes from "./routes/messageRoutes.js";
import { verifyAdmin } from "./middleware/authMiddleware.js"; // Importing verifyAdmin

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
app.use("/uploads", express.static(uploadDir));

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

const SECRET = process.env.JWT_SECRET || "supersecretkey";
const ADMIN = { username: "admin", password: "admin123" };

const Product = mongoose.model("Product", new mongoose.Schema({
  name: {
    en: { type: String, required: true },
    ta: { type: String },
    hi: { type: String },
    ml: { type: String }
  },
  description: {
    en: { type: String, required: true },
    ta: { type: String },
    hi: { type: String },
    ml: { type: String }
  },
  price: Number,
  imageUrl: String,
  specs: [{
    label: {
      en: { type: String, required: true },
      ta: { type: String },
      hi: { type: String },
      ml: { type: String }
    },
    value: {
      en: { type: String, required: true },
      ta: { type: String },
      hi: { type: String },
      ml: { type: String }
    }
  }]
}));

const HeroImage = mongoose.model("HeroImage", new mongoose.Schema({
  imageUrl: String
}));

const LoginBackground = mongoose.model("LoginBackground", new mongoose.Schema({
  imageUrl: String,
  uploadedAt: { type: Date, default: Date.now }
}));

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });
  try {
    jwt.verify(token, SECRET);
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid or expired token" });
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN.username && password === ADMIN.password) {
    const token = jwt.sign({ user: username }, SECRET, { expiresIn: "1h" });
    return res.json({ success: true, token });
  }
  res.status(401).json({ success: false, message: "Invalid credentials" });
});

app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch products", error: err.message });
  }
});

app.post("/api/products/upload", authMiddleware, upload.single("photo"), async (req, res) => {
  try {
    const { price, specs } = req.body;
    let imageUrl = "";
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    // Parse multilingual fields
    const name = {};
    const description = {};
    Object.keys(req.body).forEach(key => {
      if (key.startsWith('name[')) {
        const lang = key.match(/\[(.*?)\]/)[1];
        name[lang] = req.body[key];
      }
      if (key.startsWith('description[')) {
        const lang = key.match(/\[(.*?)\]/)[1];
        description[lang] = req.body[key];
      }
    });

    const newProduct = new Product({
      name,
      description,
      price,
      imageUrl,
      specs: specs ? JSON.parse(specs) : []
    });

    await newProduct.save();
    res.json(newProduct);
  } catch (err) {
    console.error("Product upload failed:", err);
    res.status(500).json({ message: "Product upload failed", error: err.message });
  }
});

app.delete("/api/products/:id", authMiddleware, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete product", error: err.message });
  }
});

app.put("/api/products/:id", authMiddleware, upload.single("photo"), async (req, res) => {
  try {
    const { price, specs } = req.body;
    
    // Parse multilingual fields
    const name = {};
    const description = {};
    Object.keys(req.body).forEach(key => {
      if (key.startsWith('name[')) {
        const lang = key.match(/\[(.*?)\]/)[1];
        name[lang] = req.body[key];
      }
      if (key.startsWith('description[')) {
        const lang = key.match(/\[(.*?)\]/)[1];
        description[lang] = req.body[key];
      }
    });

    const updateData = {
      name,
      description,
      price,
      specs: specs ? JSON.parse(specs) : [],
    };

    if (req.file) {
      updateData.imageUrl = `/uploads/${req.file.filename}`;
    }

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updatedProduct);
  } catch (err) {
    console.error("Failed to update product:", err);
    res.status(500).json({ message: "Failed to update product", error: err.message });
  }
});

app.get("/api/hero", async (req, res) => {
  try {
    const heroImage = await HeroImage.findOne().sort({ _id: -1 });
    res.json(heroImage || {});
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch hero image" });
  }
});

app.post("/api/hero/upload", authMiddleware, upload.single("photo"), async (req, res) => {
  try {
    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    const newHeroImage = new HeroImage({ imageUrl });
    await newHeroImage.save();
    res.json(newHeroImage);
  } catch (err) {
    res.status(500).json({ message: "Hero image upload failed", error: err.message });
  }
});

app.post("/api/loginbackground/upload", authMiddleware, upload.single("photo"), async (req, res) => {
  try {
    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    const newBackground = new LoginBackground({ imageUrl });
    await newBackground.save();
    res.json(newBackground);
  } catch (err) {
    res.status(500).json({ message: "Login background upload failed", error: err.message });
  }
});

app.get("/api/loginbackground", async (req, res) => {
  try {
    const bg = await LoginBackground.findOne().sort({ uploadedAt: -1 });
    res.json(bg || {});
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch login background image" });
  }
});

app.use("/api/messages", messageRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
