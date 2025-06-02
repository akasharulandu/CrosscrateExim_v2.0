const Product = require('../models/Product');

// Update dimensions table
exports.updateDimensions = async (req, res) => {
  try {
    const { id } = req.params;
    const { dimensions } = req.body;

    const product = await Product.findByIdAndUpdate(id, { dimensions }, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
