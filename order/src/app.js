const express = require("express");
const mongoose = require("mongoose");
const Order = require("./models/order");
const amqp = require("amqplib");
const config = require("./config");
const router = require("./routers/router");
// const messageBroker = require('./utils/messageBroker')

class App {
  constructor() {
    this.app = express();
    this.connectDB();
    this.setupOrderConsumer();
    this.setUpRouter()
    this.checkProductInfo = null
  }

  async connectDB() {
    await mongoose.connect(config.mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  }

  async disconnectDB() {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  }

  setUpRouter() {
    this.app.use('/orders', router)
  }

  async setupOrderConsumer() {
    console.log("Connecting to RabbitMQ...");

    setTimeout(async () => {
      try {
        const amqpServer = "amqp://guest:guest@uyen_rabbitmq:5672";
        const connection = await amqp.connect(amqpServer);
        console.log("Connected to RabbitMQ");
        const channel = await connection.createChannel();
        await channel.assertQueue("orders");
        await channel.assertQueue("get-all-order");
        await channel.assertQueue('wait-get-list-product-in-order');

        channel.consume("orders", async (data) => {

          console.log("Consuming ORDER service");
          const { products, username, orderId, createDate } = JSON.parse(data.content);



          const newOrder = new Order({
            products,
            username: username,
            totalPrice: products.reduce((acc, product) => acc + (product.price * product.quantity), 0),
            quantity: products.map(row => row.quantity)
          });



          const currentDate = new Date();
          currentDate.setHours(0, 0, 0, 0); // reset giờ, phút, giây, mili giây về 0
          const endDate = new Date(currentDate);
          endDate.setDate(endDate.getDate() + 1)


          const orderByuser = await Order.find(
            {
              username: username,
              createdAt: { $gte: currentDate, $lte: endDate }
            });

          // khách hàng thêm đơn hàng quá 5l trong 1 ngày 
          if (orderByuser.length >= 5) {
            const { user, products: savedProducts, totalPrice } = newOrder.toJSON();
            channel.sendToQueue(
              "products",
              Buffer.from(JSON.stringify({ orderId, user, products: savedProducts, totalPrice, status: "fail", message: 'Order have been order 5 times in one day' }))
            );
            channel.ack(data);
            console.log("Order have been order 5 times in one day");
            return;
          }


          const curDate = new Date();
          const addDate = new Date(createDate);

          let khoachCach = curDate - addDate;
          khoachCach = khoachCach / (1000 * 60 * 60);

          // Xử lý đơn hàng lố 24g phải bị xóa 
          if (khoachCach > 24) {
            const { user, products: savedProducts, totalPrice } = newOrder.toJSON();
            channel.sendToQueue(
              "products",
              Buffer.from(JSON.stringify({ orderId, user, products: savedProducts, totalPrice, status: "fail", message: 'Đơn hàng này đã lố 24g sẽ không xử lý đơn hàng này' }))
            );
            channel.ack(data);
            // console.log("Order have been order 5 times in one day");
            return;
          }

          // Save order to DB
          await newOrder.save();

          // Send ACK to ORDER service
          channel.ack(data);
          console.log("Order saved to DB and ACK sent to ORDER queue");

          // Send fulfilled order to PRODUCTS service
          // Include orderId in the message
          const { user, products: savedProducts, totalPrice } = newOrder.toJSON();
          channel.sendToQueue(
            "products",
            Buffer.from(JSON.stringify({ orderId, user, products: savedProducts, totalPrice, status: "completed" }))
          );
        });

        channel.consume('get-all-order', async (msg) => {
          // /
          const data = JSON.parse(msg.content.toString());

          console.log('đã vào đây');

          const listOrder = await Order.find({ username: data.username }).lean();
          const listOrderNew = []

          for (const tmp of listOrder) {
            this.checkProductInfo = null
            await channel.sendToQueue('get-list-product-in-order', Buffer.from(JSON.stringify({ products: tmp.products })))


            channel.consume('wait-get-list-product-in-order', (msg) => {
              const data = JSON.parse(msg.content.toString());
              this.checkProductInfo = data.products;
            });

            while (!this.checkProductInfo) {
              await new Promise(resolve => setTimeout(resolve, 100));
            }
            const tmp1 = {
              ...tmp,
              productsInfo: this.checkProductInfo
            }
            listOrderNew.push(tmp1);
          }





          channel.sendToQueue('wait-get-all-order', Buffer.from(JSON.stringify(listOrderNew)));

          channel.ack(msg);

        })
      } catch (err) {
        console.error("Failed to connect to RabbitMQ:", err.message);
      }
    }, 20000); // add a delay to wait for RabbitMQ to start in docker-compose
  }



  start() {
    this.server = this.app.listen(config.port, () =>
      console.log(`Server started on port ${config.port}`)
    );
  }

  async stop() {
    await mongoose.disconnect();
    this.server.close();
    console.log("Server stopped");
  }
}

module.exports = App;
