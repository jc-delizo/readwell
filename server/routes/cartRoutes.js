const express = require('express');
const cartController = require('../controllers/cartController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);
router.get('/view-cart', cartController.getCart);
router.post('/add-to-cart/:id', cartController.addToCart);
router.put('/update-quantities/:id', cartController.updateCartItem);
router.delete('/remove-book/:id', cartController.deleteBook);

module.exports = router;
