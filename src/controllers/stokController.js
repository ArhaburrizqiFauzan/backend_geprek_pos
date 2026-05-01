const db = require('../config/database');

// GET /api/stok — ambil status stok semua menu
const getAllStok = async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT * FROM v_status_stok`);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('getAllStok error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

// PATCH /api/stok/:id — update stok manual (pemilik only)
const updateStok = async (req, res) => {
  const { jumlah, tipe } = req.body; // tipe: 'tambah' | 'kurangi'

  if (!jumlah || !tipe) {
    return res.status(400).json({ success: false, message: 'Jumlah dan tipe wajib diisi' });
  }

  if (!['tambah', 'kurangi'].includes(tipe)) {
    return res.status(400).json({ success: false, message: 'Tipe harus tambah atau kurangi' });
  }

  if (parseInt(jumlah) <= 0) {
    return res.status(400).json({ success: false, message: 'Jumlah harus lebih dari 0' });
  }

  try {
    const [existing] = await db.query(
      `SELECT id, name, stock FROM menu_items WHERE id = ?`,
      [req.params.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Menu tidak ditemukan' });
    }

    const item = existing[0];
    const newStock = tipe === 'tambah'
      ? item.stock + parseInt(jumlah)
      : Math.max(0, item.stock - parseInt(jumlah));

    await db.query(
      `UPDATE menu_items 
       SET stock = ?,
           is_available = ?
       WHERE id = ?`,
      [newStock, newStock > 0 ? 1 : 0, req.params.id]
    );

    res.json({
      success: true,
      message: `Stok ${item.name} berhasil diperbarui`,
      data: { id: item.id, nama: item.name, stok_sebelum: item.stock, stok_sesudah: newStock },
    });

  } catch (err) {
    console.error('updateStok error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

module.exports = { getAllStok, updateStok };