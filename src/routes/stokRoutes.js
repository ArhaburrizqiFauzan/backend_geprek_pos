const express = require('express');
const router = express.Router();
const { getAllStok, updateStok } = require('../controllers/stokController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/', auth, roleCheck('pemilik'), getAllStok);
router.patch('/:id', auth, roleCheck('pemilik'), updateStok);

module.exports = router;