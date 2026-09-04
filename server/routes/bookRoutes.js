const express = require('express');
const bookController = require('../controllers/bookController');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/activebooks', bookController.getActiveBooks);
router.get('/specificbook/:id', bookController.specificBook);
router.post('/search', bookController.searchBooks);

router.use(authenticate, requireAdmin);
router.get('/', bookController.getBooks);
router.get('/archivedbooks', bookController.getArchivedBooks);
router.post('/add-book', bookController.uploadBooks);
router.put('/archive/:id', bookController.archiveBooks);
router.put('/activate/:id', bookController.activateBooks);
router.put('/:id', bookController.updateBooks);
router.delete('/:id', bookController.deleteBooks);

module.exports = router;
