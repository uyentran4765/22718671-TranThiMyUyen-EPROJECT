const Order = require('../models/order');
const OrderRepository = require('../repositories/orderRepository');
const amqp = require("amqplib");



class OrderService {
    constructor() {
        this.orderRepository = new OrderRepository();
        this.check;
        this.dataGet;
        this.getOrder = this.getOrder.bind(this);
    }

    async getOrder() {
        const rs = await this.orderRepository.getAllOrder();
        const connection = await amqp.connect('amqp://guest:guest@huy_rabbitmq:5672');
        const channel = await connection.createChannel();
        this.check = false;
        this.dataGet = null;

        const rs1 = await Promise.all(rs.map(async (row) => {

            channel.assertQueue('get-info-product-back');
            if (row.totalPrice > 1200000) {
                const productsId = row.products;

                await channel.sendToQueue(
                    'get-info-products',
                    Buffer.from(JSON.stringify({ ids: productsId }))
                )

                // console.log('sdsd1')
                channel.consume('get-info-product-back', (msg) => {
                    const data = JSON.parse(msg.content);
                    this.check = true;
                    console.log(data)
                    this.dataGet = data;
                    channel.ack(msg)
                })

                while (this.check == false) {
                    // console.log('huhu đợi xíu')
                    await new Promise(resolve => setTimeout(resolve, 1000)); // wait for 1 second before checking
                }

                return {
                    ...row,
                    infoProduct: this.dataGet
                }

            }
            return row
        }))
        return rs1;
    }

    cancleOrder = async (idOrder) => {
        const rs = await Order.findOne({ _id: idOrder }).lean();
        if (!rs) {
            return false;
        }
        if (rs.status === 'cancled' || rs.status === 'delivered') {
            return false;
        }
        try {
            const rs1 = await Order.updateOne({ _id: idOrder }, { status: 'cancled' });

            const connection = await amqp.connect('amqp://guest:guest@uyen_rabbitmq:5672');
            const channel = await connection.createChannel();
            // console.log(rs1)

            channel.sendToQueue('refund-stock-product', Buffer.from(JSON.stringify({
                products: rs.products,
                quantity: rs.quantity
            })))

            return true;
        } catch (error) {
            return false;
        }

    }
}

module.exports = OrderService;