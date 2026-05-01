const express = require('express');
const router = express.Router();
const { getAllMenu, getMenuById, createMenu, updateMenu, deleteMenu } = require('../controllers/menuController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/', auth, getAllMenu);
router.get('/:id', auth, getMenuById);
router.post('/', auth, roleCheck('pemilik'), createMenu);
router.put('/:id', auth, roleCheck('pemilik'), updateMenu);
router.delete('/:id', auth, roleCheck('pemilik'), deleteMenu);

module.exports = router;