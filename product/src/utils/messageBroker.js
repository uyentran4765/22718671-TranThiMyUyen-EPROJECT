const amqp = require("amqplib");
const Product = require("../models/product");

class MessageBroker {
  constructor() {
    this.channel = null;
  }

  async connect() {
    console.log("Connecting to RabbitMQ...");

    setTimeout(async () => {
      try {
        const connection = await amqp.connect("amqp://guest:guest@uyen_rabbitmq:5672");
        this.channel = await connection.createChannel();
        await this.channel.assertQueue("products");
        await this.channel.assertQueue("get-info-products");
        await this.channel.assertQueue("refund-stock-product");
        await this.channel.assertQueue('get-list-product-in-order')

        this.channel.consume('get-info-products', async (msg) => {
          const data = JSON.parse(msg.content.toString());
          console.log('đã nhận rồi')
          const productNeed = await Product.find({ _id: { $in: data.ids } }).lean();
          this.channel.sendToQueue('get-info-product-back', Buffer.from(JSON.stringify(productNeed)));
          this.channel.ack(msg)
        })


        this.channel.consume('refund-stock-product', async (msg) => {
          const data = JSON.parse(msg.content.toString());
          console.log('đã nhận rồi')
          const { products, quantity } = data
          // console.log(products, ' ', quantity[1])
          products.forEach(async (element, index) => {
            const rs = await Product.findOne({ _id: element });
            // console.log(rs)
            await Product.updateOne({ _id: element }, { quantity: Number(rs.quantity) + Number(quantity[index]) });
          });
          this.channel.ack(msg)
        })


        this.channel.consume('get-list-product-in-order', async (msg) => {
          const data = JSON.parse(msg.content.toString());
          const rs = []

          console.log('đã vào đây product')
          for (const element of data.products) {
            const prod = await Product.findOne({ _id: element }).lean();
            rs.push(prod)
          }
          this.channel.sendToQueue('wait-get-list-product-in-order', Buffer.from(JSON.stringify({ products: rs })));
          this.channel.ack(msg)
        })

        console.log("RabbitMQ connected");

      } catch (err) {
        console.error("Failed to connect to RabbitMQ:", err.message);
      }
    }, 10000); // delay 10 seconds to wait for RabbitMQ to start
  }

  async publishMessage(queue, message) {
    if (!this.channel) {
      console.error("No RabbitMQ channel available.");
      return;
    }

    try {
      await this.channel.sendToQueue(
        queue,
        Buffer.from(JSON.stringify(message))
      );
    } catch (err) {
      console.log(err);
    }
  }

  async consumeMessage(queue, callback) {
    if (!this.channel) {
      console.error("No RabbitMQ channel available.");
      return;
    }

    try {
      await this.channel.consume(queue, (message) => {
        console.log(`đã nhận đc tin nhắn từ ${queue}`)
        const content = message.content.toString();
        const parsedContent = JSON.parse(content);
        callback(parsedContent);
        console.log('đã nhận')
        this.channel.ack(message);
      });
    } catch (err) {
      console.log(err);
    }
  }
}

module.exports = new MessageBroker();
