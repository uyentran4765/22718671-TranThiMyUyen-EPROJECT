const ProductsRepository = require("../repositories/productsRepository");
const messageBroker = require("../utils/messageBroker");
const Product = require('../models/product')
// const messageBroker = require("../utils/messageBroker");
const uuid = require('uuid');

/**
 * Class that ties together the business logic and the data access layer
 */
class ProductsService {
  constructor() {
    this.productsRepository = new ProductsRepository();
    this.saveOrder = this.saveOrder.bind(this)
    this.ordersMap = new Map();
  }

  async createProduct(product) {
    const createdProduct = await this.productsRepository.create(product);
    return createdProduct;
  }

  async getProductById(productId) {
    const product = await this.productsRepository.findById(productId);
    return product;
  }

  async getProducts() {
    const products = await this.productsRepository.findAll();
    return products;
  }


  async saveOrder(data) {
    try {
      // lấy data
      const { ids, username } = data;

      // lọc các id sản phẩm thành mảng 
      const idds = ids.map(row => row.id)

      // lấy thông tin sản phẩm
      const products = await Product.find({ _id: { $in: idds } });

      // bỏ vào quantity mà ng dùng đặt để gửi qua orderservice
      const newProducts = products.map((row, index) => {
        return {
          ...row._doc,
          quantity: ids[index].quantity
        }
      }
      )

      // kiểm tra số lượng đặt
      const rs = await this.checkquantity(ids);
      if (!rs) {
        return {
          message: 'Số Lượng Không Đủ !!!',
          status: 'fail',
          code: 400
        }
      }

      const orderId = uuid.v4(); // Generate a unique order ID
      this.ordersMap.set(orderId, {
        status: "pending",
        products: newProducts,
        username: username,
        message: ''
      });

      await messageBroker.publishMessage("orders", {
        products: newProducts,
        username: username,
        orderId, // include the order ID in the message to orders queue
        createDate: new Date()
      });

      messageBroker.consumeMessage("products", (data) => {
        const orderData = JSON.parse(JSON.stringify(data));

        const { orderId } = orderData;
        const order = this.ordersMap.get(orderId);

        if (orderData.status == 'fail') {
          this.ordersMap.set(orderId, { ...order, ...orderData, status: 'fail' });
          // console.log("Updated order 1:", order);
        }

        if (order && orderData.status == 'completed') {
          // update the order in the map
          this.ordersMap.set(orderId, { ...order, ...orderData, status: 'completed' });
          // console.log("Updated order 2:", order);
        }
      });

      // Long polling until order is completed
      let order = this.ordersMap.get(orderId);
      while (order.status !== 'completed' && order.status !== 'fail') {
        await new Promise(resolve => setTimeout(resolve, 1000)); // wait for 1 second before checking status again
        order = this.ordersMap.get(orderId);
      }

      if (order.status == 'fail') {
        // return res.status(500).json(`${req.user.username} đã thêm đơn hàng tới 5 lần rồi cút đi chỗ khác !!!`);
        return {
          message: order.message,
          status: 'fail',
          code: 400
        }
      }

      // cập nhật số lượng sau khi hoàn thành 
      const rs1 = this.updateproducts(ids);
      if (!rs1) {
        return {
          message: 'Cập nhật thất bại !!!',
          status: "fail",
          code: 500
        }
      }

      // trả về kết quả phù hợp
      return {
        message: 'Đã cập nhật đơn hàng thành công !!',
        status: 'success',
        code: 200

      };
    } catch (error) {
      console.error(error);
      return {
        message: 'Đã cập nhật đơn hàng thất bại !!',
        status: 'fail',
        code: 500
      };
    }
  }

  async checkquantity(ids) {

    for (const tmp of ids) {
      const rs = await this.productsRepository.findById(tmp.id);
      if (!rs) {
        return false;
      }
      if (rs.quantity < tmp.quantity) {
        return false;
      }
    }
    return true;

  }

  async updateproducts(ids) {
    for (const tmp of ids) {
      const rs = await this.productsRepository.findById(tmp.id);
      if (!rs) {
        return false;
      }
      const quantitynew = rs.quantity - tmp.quantity;
      await this.productsRepository.updateQuantityProduct(tmp, quantitynew);
    }
    return true;
  }

}

module.exports = ProductsService;
