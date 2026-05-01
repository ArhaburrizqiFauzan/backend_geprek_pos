const express = require('express');
const router = express.Router();
const { createTransaksi, getAllTransaksi } = require('../controllers/transaksiController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.post('/', auth, createTransaksi);
router.get('/', auth, roleCheck('pemilik'), getAllTransaksi);

module.exports = router;