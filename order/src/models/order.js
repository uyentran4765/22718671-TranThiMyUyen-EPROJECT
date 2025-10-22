const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'products',
    required: true,
  }],
  username: {
    type: String,
    required: true,
  },
  quantity: {
    type: Array,
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ['ordered', 'delivered', 'cancled'], // chỉ cho phép 2 giá trị này
    default: 'ordered', // giá trị mặc định khi tạo order mới
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { collection: 'orders' });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
