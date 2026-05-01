const db = require('../config/database');

// GET /api/menu — ambil semua menu
const getAllMenu = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, name, category, price, stock, description, is_available
       FROM menu_items
       ORDER BY category, name`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('getAllMenu error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

// GET /api/menu/:id — ambil satu menu
const getMenuById = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, name, category, price, stock, description, is_available
       FROM menu_items WHERE id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Menu tidak ditemukan' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('getMenuById error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

// POST /api/menu — tambah menu baru (pemilik only)
const createMenu = async (req, res) => {
  const { name, category, price, stock, description } = req.body;

  if (!name || !category || !price) {
    return res.status(400).json({ success: false, message: 'Nama, kategori, dan harga wajib diisi' });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO menu_items (id, name, category, price, stock, description)
       VALUES (UUID(), ?, ?, ?, ?, ?)`,
      [name, category, price, stock || 0, description || null]
    );

    const [newItem] = await db.query(
      `SELECT * FROM menu_items WHERE name = ? ORDER BY created_at DESC LIMIT 1`,
      [name]
    );

    res.status(201).json({ success: true, message: 'Menu berhasil ditambahkan', data: newItem[0] });
  } catch (err) {
    console.error('createMenu error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

// PUT /api/menu/:id — edit menu (pemilik only)
const updateMenu = async (req, res) => {
  const { name, category, price, stock, description, is_available } = req.body;

  try {
    const [existing] = await db.query(`SELECT id FROM menu_items WHERE id = ?`, [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Menu tidak ditemukan' });
    }

    await db.query(
      `UPDATE menu_items 
       SET name = COALESCE(?, name),
           category = COALESCE(?, category),
           price = COALESCE(?, price),
           stock = COALESCE(?, stock),
           description = COALESCE(?, description),
           is_available = COALESCE(?, is_available)
       WHERE id = ?`,
      [name, category, price, stock, description, is_available, req.params.id]
    );

    const [updated] = await db.query(`SELECT * FROM menu_items WHERE id = ?`, [req.params.id]);
    res.json({ success: true, message: 'Menu berhasil diperbarui', data: updated[0] });
  } catch (err) {
    console.error('updateMenu error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

// DELETE /api/menu/:id — hapus menu (pemilik only)
const deleteMenu = async (req, res) => {
  try {
    const [existing] = await db.query(`SELECT id FROM menu_items WHERE id = ?`, [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Menu tidak ditemukan' });
    }

    await db.query(`DELETE FROM menu_items WHERE id = ?`, [req.params.id]);
    res.json({ success: true, message: 'Menu berhasil dihapus' });
  } catch (err) {
    console.error('deleteMenu error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

module.exports = { getAllMenu, getMenuById, createMenu, updateMenu, deleteMenu };