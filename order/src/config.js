require('dotenv').config();

module.exports = {
    mongoURI: process.env.MONGODB_ORDER_URI || 'mongodb://localhost/orders',
    rabbitMQURI: 'amqp://guest:guest@uyen_rabbitmq:5672',
    rabbitMQQueue: 'orders',
    port: 3002
};
