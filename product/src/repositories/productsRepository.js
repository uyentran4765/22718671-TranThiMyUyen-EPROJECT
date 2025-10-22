const mongoose = require("mongoose");
const Product = require('../models/product')


class ProductsRepository {
  async create(product) {
    const createdProduct = await Product.create(product);
    return createdProduct.toObject();
  }

  async findById(productId) {
    const product = await Product.findById(productId).lean();
    return product;
  }

  async findAll() {
    const products = await Product.find().lean();
    return products;
  }

  async updateQuantityProduct(product, quantity) {
    const products = await Product.updateOne({ _id: product.id }, { quantity: quantity });
    return true;
  }
}

module.exports = ProductsRepository;
