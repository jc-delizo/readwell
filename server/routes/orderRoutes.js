const express = require('express');
const orderController = require('../controllers/orderController');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);
router.post('/checkout', orderController.checkout);
router.get('/retrieve-a-user-order', orderController.getOrdersOfUser);
router.delete('/delete-order/:id', orderController.deleteOrder);

router.get('/get-orders', requireAdmin, orderController.getOrdersOfAllUsers);
router.put('/order-delivered/:id', requireAdmin, orderController.orderDeliver);
router.get('/delivered', requireAdmin, orderController.delivered);
router.get('/not-delivered', requireAdmin, orderController.notDelivered);

module.exports = router;
