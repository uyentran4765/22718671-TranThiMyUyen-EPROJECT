const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/orderController');

const controller = new OrderController();

router.get('/api/v1', controller.getAllOrder);
router.put('/api/v1/cancle/:id', controller.deleteOrder);
// router.get('/api/v1' , controller.getAllOrder);


module.exports = router