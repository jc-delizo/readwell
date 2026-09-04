const express = require('express');
const userController = require('../controllers/userController');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.get('/details', authenticate, userController.getProfile);
router.get('/me', authenticate, userController.getProfile);

router.use(authenticate, requireAdmin);
router.get('/all', userController.getAllUsers);
router.get('/whosthisuser/:id', userController.getUser);
router.put('/makeadmin/:id', userController.promoteToAdmin);
router.put('/makeuser/:id', userController.demoteToUser);

module.exports = router;
