const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  quantity: { type: Number, required: true }
}, { collection: 'products' });

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
