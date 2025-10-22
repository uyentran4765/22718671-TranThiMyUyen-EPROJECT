const Product = require("../models/product");
const ProductsService = require("../services/productsService");
const messageBroker = require("../utils/messageBroker");
const uuid = require('uuid');

/**
 * Class to hold the API implementation for the product services
 */
class ProductController {

  constructor() {
    this.createOrder = this.createOrder.bind(this);
    // this.getOrderStatus = this.getOrderStatus.bind(this);
    // this.ordersMap = new Map();
    this.productService = new ProductsService()
  }

  async createProduct(req, res, next) {
    try {
      const token = req.headers.authorization;
      if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const product = new Product(req.body);

      const validationError = product.validateSync();
      if (validationError) {
        return res.status(400).json({ message: validationError.message });
      }

      await product.save({ timeout: 30000 });

      res.status(201).json(product);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }

  async createOrder(req, res) {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const data = req.body;

    data.username = req.user.username
    const rs = await this.productService.saveOrder(data);
    return res.status(rs.code).json({ message: rs.message });
  }


  // async getOrderStatus(req, res, next) {
  //   const { orderId } = req.params;
  //   const order = this.ordersMap.get(orderId);
  //   if (!order) {
  //     return res.status(404).json({ message: 'Order not found' });
  //   }
  //   return res.status(200).json(order);
  // }

  async getProducts(req, res, next) {
    try {
      const token = req.headers.authorization;
      if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const products = await Product.find({});

      res.status(200).json(products);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
}

module.exports = ProductController;
