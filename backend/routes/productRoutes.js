const express = require('express');
const multer = require('multer');
const path = require('path');
const Product = require('../models/Product');

const router = express.Router();

// Optional: JWT auth middleware (for admin routes)
// const authMiddleware = require('../middleware/auth');

// Setup Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Ensure this folder exists
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Helper to safely parse dimensions
const parseDimensions = (dimensions) => {
  try {
    return dimensions ? JSON.parse(dimensions) : [];
  } catch (err) {
    console.error('Dimension parsing error:', err);
    return [];
  }
};

// GET all products (Public)
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.error('Fetch products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST create a new product (Admin only)
// router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, dimensions } = req.body;

    const newProduct = new Product({
      name,
      description,
      price,
      dimensions: parseDimensions(dimensions),
      imageUrl: req.file ? `/uploads/${req.file.filename}` : '',
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(400).json({ message: 'Failed to create product' });
  }
});

// PUT update a product (Admin only)
// router.put('/:id', authMiddleware, upload.single('image'), async (req, res) => {
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, dimensions } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ message: 'Product not found' });

    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.dimensions = parseDimensions(dimensions);

    if (req.file) {
      product.imageUrl = `/uploads/${req.file.filename}`;
    }

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(400).json({ message: 'Failed to update product' });
  }
});

// DELETE a product (Admin only)
// router.delete('/:id', authMiddleware, async (req, res) => {
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Failed to delete product' });
  }
});

module.exports = router;
