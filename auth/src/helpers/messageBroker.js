const amqp = require("amqplib");

class MessageBroker {
    constructor() {
        this.channel = null;
    }

    setUpConnection = async () => {

        setTimeout(async () => {
            try {
                const connection = await amqp.connect('amqp://guest:guest@uyen_rabbitmq:5672');
                this.channel = await connection.createChannel();
                this.channel.assertQueue('wait-get-all-order')
                console.log('Bạn đã kết nối thành công !!!')
            } catch (error) {
                console.log(error);
            }
        }, 10000)
    }

    publishMessage = async (queueName, msg) => {
        if (!this.channel) {
            console.log('Chưa có một channel nào !!!');
            return;
        }

        try {
            // console.log(msg, 'sdsdsd')
            await this.channel.sendToQueue(queueName, Buffer.from(JSON.stringify(msg)));
            console.log('đã gửi tin nhắn đến nơi chỉ định')
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = new MessageBroker()