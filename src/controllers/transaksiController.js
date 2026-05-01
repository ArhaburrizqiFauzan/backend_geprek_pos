const db = require('../config/database');

// POST /api/transaksi — buat transaksi baru
const createTransaksi = async (req, res) => {
  const { payment_method, cash_received, notes, items } = req.body;

  // Validasi input
  if (!payment_method || !items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Metode pembayaran dan item wajib diisi' });
  }

  if (!['tunai', 'qris'].includes(payment_method)) {
    return res.status(400).json({ success: false, message: 'Metode pembayaran tidak valid' });
  }

  if (payment_method === 'tunai' && !cash_received) {
    return res.status(400).json({ success: false, message: 'Jumlah uang diterima wajib diisi untuk pembayaran tunai' });
  }

  try {
    // Hitung total & validasi stok
    let total_amount = 0;
    for (const item of items) {
      const [rows] = await db.query(
        `SELECT id, name, price, stock FROM menu_items WHERE id = ?`,
        [item.menu_item_id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: `Menu tidak ditemukan: ${item.menu_item_id}` });
      }

      const menu = rows[0];

      if (menu.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Stok ${menu.name} tidak mencukupi` });
      }

      item.unit_price = parseFloat(menu.price);
      item.subtotal = item.unit_price * item.quantity;
      total_amount += item.subtotal;
    }

    // Validasi uang tunai cukup
    if (payment_method === 'tunai' && parseFloat(cash_received) < total_amount) {
      return res.status(400).json({ success: false, message: 'Jumlah uang tidak mencukupi' });
    }

    // Generate transaction code
    const [countRows] = await db.query(`SELECT COUNT(*) as total FROM transactions`);
    const count = countRows[0].total + 1;
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const transaction_code = `TRX-${today}-${String(count).padStart(3, '0')}`;

    const change_amount = payment_method === 'tunai'
      ? parseFloat(cash_received) - total_amount
      : null;

    // Insert transaksi
    const transactionId = await db.query(`SELECT UUID() as id`).then(([r]) => r[0].id);

    await db.query(
      `INSERT INTO transactions (id, transaction_code, cashier_id, total_amount, payment_method, cash_received, change_amount, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [transactionId, transaction_code, req.user.id, total_amount, payment_method,
       cash_received || null, change_amount, notes || null]
    );

    // Insert order items + dekrementasi stok
    for (const item of items) {
      await db.query(
        `INSERT INTO order_items (id, transaction_id, menu_item_id, quantity, unit_price, subtotal)
         VALUES (UUID(), ?, ?, ?, ?, ?)`,
        [transactionId, item.menu_item_id, item.quantity, item.unit_price, item.subtotal]
      );

      await db.query(
        `UPDATE menu_items SET stock = stock - ? WHERE id = ?`,
        [item.quantity, item.menu_item_id]
      );

      // Auto nonaktifkan kalau stok habis
      await db.query(
        `UPDATE menu_items SET is_available = 0 WHERE id = ? AND stock = 0`,
        [item.menu_item_id]
      );
    }

    res.status(201).json({
      success: true,
      message: 'Transaksi berhasil diproses',
      data: {
        transaction_code,
        total_amount,
        payment_method,
        cash_received: cash_received || null,
        change_amount,
      },
    });

  } catch (err) {
    console.error('createTransaksi error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

// GET /api/transaksi — ambil semua transaksi (pemilik only)
const getAllTransaksi = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM v_detail_transaksi`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('getAllTransaksi error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

module.exports = { createTransaksi, getAllTransaksi };