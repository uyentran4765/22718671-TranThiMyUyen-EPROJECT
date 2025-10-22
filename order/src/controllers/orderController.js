const Order = require('../models/order');
const OrderService = require('../services/orderService')

class OrderController {
    constructor() {
        this.orderService = new OrderService();
        this.getAllOrder = this.getAllOrder.bind(this);
        this.deleteOrder = this.deleteOrder.bind(this)
    }

    async getAllOrder(req, res) {
        const rs = await this.orderService.getOrder();
        return res.json(rs);
    }

    async deleteOrder(req, res) {
        const id = req.params.id;
        const rs = await this.orderService.cancleOrder(id);
        if (!rs) {
            return res.status(400).json({ message: 'Hủy Đơn Hàng Thất Bại' })
        }
        res.json({ message: 'Đã Hủy Đơn Hàng' })
    }
}

module.exports = OrderController;