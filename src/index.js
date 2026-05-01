const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

//Routes
const authRoutes = require('./routes/authRoutes')
const menuRoutes = require('./routes/menuRoutes')
const transaksiRoutes = require('./routes/transaksiRoutes')
const stokRoutes = require('./routes/stokRoutes')
const laporanRoutes = require('./routes/laporanRoutes')

// Middleware global
app.use(helmet());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Geprek POS API berjalan' })
});

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/menu', menuRoutes)
app.use('/api/transaksi', transaksiRoutes)
app.use('/api/stok', stokRoutes)
app.use('/api/laporan', laporanRoutes)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan' })
});

// Error handler global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' })
});

app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`)
});