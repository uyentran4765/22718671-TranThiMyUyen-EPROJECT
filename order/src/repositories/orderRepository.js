const Order = require('../models/order');

class OrderRepository {
    createOrder = async (orderdata) => {
        const rs = await Order.create(orderdata);
        return rs.toObject();
    }

    getAllOrder = async () => {
        const rs = await Order.find().lean();
        return rs;
    }


    updateOrder = async (orderdata, id) => {
        const rs = await Order.updateOne(
            { _id: id },
            {
                orderdata
            });
        return true
    }

    deleteOrder = async (id) => {
        const rs = await Order.delete({ _id: id })
        return true;
    }

    findById = async (id) => {
        const rs = await Order.findOne({ _id: id })
        return rs;
    }
}

module.exports = OrderRepository;