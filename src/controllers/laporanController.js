const db = require('../config/database');

// GET /api/laporan/harian — laporan hari ini
const getLaporanHarian = async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);

    const [ringkasan] = await db.query(
      `SELECT * FROM v_laporan_harian WHERE tanggal = ?`,
      [today]
    );

    const [detail] = await db.query(
      `SELECT * FROM v_detail_transaksi
       WHERE DATE(transaction_date) = ?`,
      [today]
    );

    res.json({
      success: true,
      data: {
        ringkasan: ringkasan[0] || {
          tanggal: today,
          jumlah_transaksi: 0,
          pendapatan_tunai: 0,
          pendapatan_qris: 0,
          total_pendapatan: 0,
        },
        transaksi: detail,
      },
    });

  } catch (err) {
    console.error('getLaporanHarian error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

// GET /api/laporan/harian?tanggal=2025-04-29 — laporan by tanggal
const getLaporanByTanggal = async (req, res) => {
  const { tanggal } = req.query;

  if (!tanggal) {
    return res.status(400).json({ success: false, message: 'Parameter tanggal wajib diisi' });
  }

  try {
    const [ringkasan] = await db.query(
      `SELECT * FROM v_laporan_harian WHERE tanggal = ?`,
      [tanggal]
    );

    const [detail] = await db.query(
      `SELECT * FROM v_detail_transaksi WHERE DATE(transaction_date) = ?`,
      [tanggal]
    );

    res.json({
      success: true,
      data: {
        ringkasan: ringkasan[0] || {
          tanggal,
          jumlah_transaksi: 0,
          pendapatan_tunai: 0,
          pendapatan_qris: 0,
          total_pendapatan: 0,
        },
        transaksi: detail,
      },
    });

  } catch (err) {
    console.error('getLaporanByTanggal error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

module.exports = { getLaporanHarian, getLaporanByTanggal };