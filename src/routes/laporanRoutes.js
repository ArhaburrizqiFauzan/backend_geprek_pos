const express = require('express');
const router = express.Router();
const { getLaporanHarian, getLaporanByTanggal } = require('../controllers/laporanController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/harian', auth, roleCheck('pemilik'), getLaporanHarian);
router.get('/filter', auth, roleCheck('pemilik'), getLaporanByTanggal);

module.exports = router;