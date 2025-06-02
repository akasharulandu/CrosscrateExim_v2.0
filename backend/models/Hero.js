const mongoose = require("mongoose");

const heroSchema = new mongoose.Schema({
  imageUrl: String,
});

module.exports = mongoose.model("Hero", heroSchema);
